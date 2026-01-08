import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminActivity } from "@/lib/activityLogger";

export async function PATCH(
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
    const {
      bookingType,
      bookingDate,
      startTime,
      endTime,
      duration,
      totalAmount,
    } = body;

    if (!bookingType || !bookingDate || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const bookingDateObj = new Date(bookingDate);

    if (bookingType === "MEMBER") {
      // MEMBER BOOKING
      const result = await prisma.$transaction(async (tx) => {
        const currentBooking = await tx.meetingRoomBooking.findUnique({
          where: { id },
          include: { room: true, user: true },
        });

        if (!currentBooking) {
          throw new Error("Booking not found");
        }

        const roomId = currentBooking.roomId;

        const userConflicts = await tx.meetingRoomBooking.findMany({
          where: {
            id: { not: id },
            roomId,
            bookingDate: bookingDateObj,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        });

        const customerConflicts = await tx.customerMeetingRoomBooking.findMany({
          where: {
            roomId,
            bookingDate: bookingDateObj,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        });

        const allBookings = [
          ...userConflicts.map((b) => ({
            startTime: b.startTime,
            endTime: b.endTime,
          })),
          ...customerConflicts.map((b) => ({
            startTime: b.startTime,
            endTime: b.endTime,
          })),
        ];

        for (const booking of allBookings) {
          if (startTime < booking.endTime && endTime > booking.startTime) {
            throw new Error("This time slot is already booked");
          }
        }

        const updatedBooking = await tx.meetingRoomBooking.update({
          where: { id },
          data: {
            bookingDate: bookingDateObj,
            startTime,
            endTime,
            duration,
            totalAmount,
          },
          include: {
            room: true,
            payment: true,
            user: true,
          },
        });

        if (updatedBooking.paymentId) {
          await tx.payment.update({
            where: { id: updatedBooking.paymentId },
            data: { amount: totalAmount },
          });
        }

        return { currentBooking, updatedBooking };
      });

      const contactName =
        result.updatedBooking.user?.name || result.updatedBooking.contactName;

      await logAdminActivity(
        session.user.id!,
        "ADMIN_BOOKING_CREATED",
        `Updated booking schedule for ${contactName} - ${result.updatedBooking.room.name}`,
        {
          referenceId: id,
          referenceType: "MEETING_ROOM_BOOKING",
          metadata: {
            bookingType: "MEMBER",
            contactName,
            roomName: result.updatedBooking.room.name,
            oldDate: result.currentBooking.bookingDate.toISOString(),
            oldStartTime: result.currentBooking.startTime,
            oldEndTime: result.currentBooking.endTime,
            newDate: bookingDate,
            newStartTime: startTime,
            newEndTime: endTime,
            duration,
            totalAmount,
          },
          request,
        }
      );

      return NextResponse.json({
        success: true,
        data: result.updatedBooking,
        message: "Booking updated successfully",
      });
    } else {
      // CUSTOMER BOOKING
      const result = await prisma.$transaction(async (tx) => {
        const currentBooking = await tx.customerMeetingRoomBooking.findUnique({
          where: { id },
          include: { room: true, customer: true },
        });

        if (!currentBooking) {
          throw new Error("Booking not found");
        }

        const roomId = currentBooking.roomId;

        const userConflicts = await tx.meetingRoomBooking.findMany({
          where: {
            roomId,
            bookingDate: bookingDateObj,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        });

        const customerConflicts = await tx.customerMeetingRoomBooking.findMany({
          where: {
            id: { not: id },
            roomId,
            bookingDate: bookingDateObj,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        });

        const allBookings = [
          ...userConflicts.map((b) => ({
            startTime: b.startTime,
            endTime: b.endTime,
          })),
          ...customerConflicts.map((b) => ({
            startTime: b.startTime,
            endTime: b.endTime,
          })),
        ];

        for (const booking of allBookings) {
          if (startTime < booking.endTime && endTime > booking.startTime) {
            throw new Error("This time slot is already booked");
          }
        }

        const updatedBooking = await tx.customerMeetingRoomBooking.update({
          where: { id },
          data: {
            bookingDate: bookingDateObj,
            startTime,
            endTime,
            duration,
            totalAmount,
          },
          include: {
            room: true,
            payment: true,
            customer: true,
          },
        });

        if (updatedBooking.paymentId) {
          await tx.customerPayment.update({
            where: { id: updatedBooking.paymentId },
            data: { amount: totalAmount },
          });
        }

        return { currentBooking, updatedBooking };
      });

      const contactName =
        result.updatedBooking.customer?.name ||
        result.updatedBooking.contactName;

      await logAdminActivity(
        session.user.id!,
        "ADMIN_BOOKING_CREATED",
        `Updated booking schedule for ${contactName} - ${result.updatedBooking.room.name}`,
        {
          referenceId: id,
          referenceType: "CUSTOMER_MEETING_ROOM_BOOKING",
          metadata: {
            bookingType: "CUSTOMER",
            contactName,
            roomName: result.updatedBooking.room.name,
            oldDate: result.currentBooking.bookingDate.toISOString(),
            oldStartTime: result.currentBooking.startTime,
            oldEndTime: result.currentBooking.endTime,
            newDate: bookingDate,
            newStartTime: startTime,
            newEndTime: endTime,
            duration,
            totalAmount,
          },
          request,
        }
      );

      return NextResponse.json({
        success: true,
        data: result.updatedBooking,
        message: "Booking updated successfully",
      });
    }
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update booking",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const bookingType = searchParams.get("type");

    if (!bookingType) {
      return NextResponse.json(
        { success: false, error: "Booking type is required" },
        { status: 400 }
      );
    }

    if (bookingType === "MEMBER") {
      const booking = await prisma.meetingRoomBooking.findUnique({
        where: { id },
        include: { room: true, user: true },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        );
      }

      if (booking.status !== "CANCELLED") {
        return NextResponse.json(
          { success: false, error: "Only cancelled bookings can be deleted" },
          { status: 400 }
        );
      }

      const contactName = booking.user?.name || booking.contactName;

      await prisma.meetingRoomBooking.delete({ where: { id } });

      await logAdminActivity(
        session.user.id!,
        "ROOM_BOOKING_CANCELLED",
        `Deleted cancelled booking for ${contactName} - ${booking.room.name}`,
        {
          referenceId: id,
          referenceType: "MEETING_ROOM_BOOKING",
          metadata: {
            bookingType: "MEMBER",
            contactName,
            roomName: booking.room.name,
            bookingDate: booking.bookingDate.toISOString(),
            startTime: booking.startTime,
            endTime: booking.endTime,
          },
          request,
        }
      );

      return NextResponse.json({
        success: true,
        message: "Booking deleted successfully",
      });
    } else {
      const booking = await prisma.customerMeetingRoomBooking.findUnique({
        where: { id },
        include: { room: true, customer: true },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        );
      }

      if (booking.status !== "CANCELLED") {
        return NextResponse.json(
          { success: false, error: "Only cancelled bookings can be deleted" },
          { status: 400 }
        );
      }

      const contactName = booking.customer?.name || booking.contactName;

      await prisma.customerMeetingRoomBooking.delete({ where: { id } });

      await logAdminActivity(
        session.user.id!,
        "ROOM_BOOKING_CANCELLED",
        `Deleted cancelled booking for ${contactName} - ${booking.room.name}`,
        {
          referenceId: id,
          referenceType: "CUSTOMER_MEETING_ROOM_BOOKING",
          metadata: {
            bookingType: "CUSTOMER",
            contactName,
            roomName: booking.room.name,
            bookingDate: booking.bookingDate.toISOString(),
            startTime: booking.startTime,
            endTime: booking.endTime,
          },
          request,
        }
      );

      return NextResponse.json({
        success: true,
        message: "Booking deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete booking",
      },
      { status: 500 }
    );
  }
}
