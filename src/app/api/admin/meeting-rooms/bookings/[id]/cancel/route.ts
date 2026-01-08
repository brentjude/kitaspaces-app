import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminActivity } from "@/lib/activityLogger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { bookingType, reason } = body;

    if (!bookingType || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (bookingType === "MEMBER") {
      const cancelledBooking = await prisma.$transaction(async (tx) => {
        const booking = await tx.meetingRoomBooking.findUnique({
          where: { id },
          include: { room: true, payment: true, user: true },
        });

        if (!booking) {
          throw new Error("Booking not found");
        }

        if (booking.status === "CANCELLED") {
          throw new Error("Booking is already cancelled");
        }

        const updated = await tx.meetingRoomBooking.update({
          where: { id },
          data: {
            status: "CANCELLED",
            notes: booking.notes
              ? `${booking.notes}\n\n[CANCELLED] ${reason}`
              : `[CANCELLED] ${reason}`,
          },
          include: { room: true, user: true },
        });

        if (booking.paymentId) {
          await tx.payment.delete({
            where: { id: booking.paymentId },
          });
        }

        return updated;
      });

      const contactName =
        cancelledBooking.user?.name || cancelledBooking.contactName;

      await logAdminActivity(
        session.user.id!,
        "ROOM_BOOKING_CANCELLED",
        `Cancelled booking for ${contactName} - ${cancelledBooking.room.name}`,
        {
          referenceId: id,
          referenceType: "MEETING_ROOM_BOOKING",
          metadata: {
            bookingType: "MEMBER",
            contactName,
            reason,
            roomName: cancelledBooking.room.name,
            bookingDate: cancelledBooking.bookingDate.toISOString(),
            startTime: cancelledBooking.startTime,
            endTime: cancelledBooking.endTime,
          },
          request,
        }
      );

      return NextResponse.json({
        success: true,
        data: cancelledBooking,
        message: "Booking cancelled successfully",
      });
    } else {
      // CUSTOMER booking
      const cancelledBooking = await prisma.$transaction(async (tx) => {
        const booking = await tx.customerMeetingRoomBooking.findUnique({
          where: { id },
          include: { room: true, payment: true, customer: true },
        });

        if (!booking) {
          throw new Error("Booking not found");
        }

        if (booking.status === "CANCELLED") {
          throw new Error("Booking is already cancelled");
        }

        const updated = await tx.customerMeetingRoomBooking.update({
          where: { id },
          data: {
            status: "CANCELLED",
            notes: booking.notes
              ? `${booking.notes}\n\n[CANCELLED] ${reason}`
              : `[CANCELLED] ${reason}`,
          },
          include: { room: true, customer: true },
        });

        if (booking.paymentId) {
          await tx.customerPayment.delete({
            where: { id: booking.paymentId },
          });
        }

        return updated;
      });

      const contactName =
        cancelledBooking.customer?.name || cancelledBooking.contactName;

      await logAdminActivity(
        session.user.id!,
        "ROOM_BOOKING_CANCELLED",
        `Cancelled booking for ${contactName} - ${cancelledBooking.room.name}`,
        {
          referenceId: id,
          referenceType: "CUSTOMER_MEETING_ROOM_BOOKING",
          metadata: {
            bookingType: "CUSTOMER",
            contactName,
            reason,
            roomName: cancelledBooking.room.name,
            bookingDate: cancelledBooking.bookingDate.toISOString(),
            startTime: cancelledBooking.startTime,
            endTime: cancelledBooking.endTime,
          },
          request,
        }
      );

      return NextResponse.json({
        success: true,
        data: cancelledBooking,
        message: "Booking cancelled successfully",
      });
    }
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to cancel booking",
      },
      { status: 500 }
    );
  }
}
