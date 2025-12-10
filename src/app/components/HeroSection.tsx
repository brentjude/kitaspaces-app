import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="relative bg-primary overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-background.jpg"
          alt="KITA Spaces Hero Background"
          fill
          priority
          className="object-cover opacity-90"
          quality={90}
        />
        {/* Orange Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/80 via-primary/70 to-primary/90" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight drop-shadow-lg">
          Great Minds{" "}
          <span className="text-white drop-shadow-lg">Meet Here</span>
        </h1>

        <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md mb-12">
          Join our vibrant community at KITA Spaces. Discover exclusive
          workshops, networking sessions, and wellness activities designed to
          help you <span className="font-semibold text-white">thrive</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            href="/member-registration"
            className="group w-full sm:w-auto px-8 py-4 bg-white text-primary rounded-xl text-lg font-bold hover:bg-white/95 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            Be a KITA Member
            <svg
              className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>

          <Link
            href="/events"
            className="group w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl text-lg font-bold hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            See Events
            <svg
              className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
