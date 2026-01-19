import Link from 'next/link';
import Image from 'next/image';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#ff8e49] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo/kita-primary-logo.png"
                alt="KitaSpaces Logo"
                width={120}
                height={60}
                className="brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/90">
              Your premier coworking space for productivity, collaboration, and community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-white/90 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-sm text-white/90 hover:text-white transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/meeting-rooms"
                  className="text-sm text-white/90 hover:text-white transition-colors"
                >
                  Meeting Rooms
                </Link>
              </li>
              <li>
                <Link
                  href="/member-registration"
                  className="text-sm text-white/90 hover:text-white transition-colors"
                >
                  Become a Member
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPinIcon className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <span className="text-sm text-white/90">
                  kita Spaces, 3rd Floor, Capitol Square, Escario St., Cebu City
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="w-5 h-5 text-white shrink-0" />
                <a
                  href="tel:+639173090180"
                  className="text-sm text-white/90 hover:text-white transition-colors"
                >
                  +63 917 309 0180
                </a>
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-white shrink-0" />
                <a
                  href="mailto:kitaspaces@gmail.com"
                  className="text-sm text-white/90 hover:text-white transition-colors"
                >
                  kitaspaces@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Business Hours</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <ClockIcon className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div className="text-sm text-white/90">
                  <p className="font-medium text-white">Monday - Sundays</p>
                  <p>9 AM - 11 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/80">
              © {currentYear} KitaSpaces. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}