export default function HeroSection() {
  return (
    <div className="bg-linear-to-b from-orange-50 via-orange-50/50 to-white py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:py-32 text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold text-foreground mb-6">
          Great Minds Meet Here
        </h1>

        <p className="text-xl sm:text-2xl text-foreground/60 max-w-3xl mx-auto leading-relaxed font-light">
          Join our vibrant community at KITA Spaces. Discover exclusive
          workshops, networking sessions, and wellness activities designed to
          help you <span className="font-semibold text-primary">thrive</span>.
        </p>
      </div>
    </div>
  );
}
