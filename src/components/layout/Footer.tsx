import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Heart } from "lucide-react";
import logo from "@/assets/rhrci-logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Mission */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="RHRCI Logo" className="h-16 w-16 rounded-full object-cover" />
            </Link>
            <h3 className="font-display text-xl font-semibold mb-2">
              Raising the Hope of Rural Children Initiative
            </h3>
            <p className="text-background/70 text-sm font-body">
              From the Village to the World: Bridging Dreams, Unlocking Potentials
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 font-body">
              <li>
                <Link to="/about" className="text-background/70 hover:text-background transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-background/70 hover:text-background transition-colors">
                  Our Programs
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-background/70 hover:text-background transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-background/70 hover:text-background transition-colors">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-background transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Our Programs</h4>
            <ul className="space-y-3 font-body text-sm">
              <li className="text-background/70">Education Support</li>
              <li className="text-background/70">Menstrual Hygiene Awareness</li>
              <li className="text-background/70">Rights Advocacy</li>
              <li className="text-background/70">Cultural Preservation</li>
              <li className="text-background/70">Child Protection</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4 font-body">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-background/70 text-sm">
                  Mazi Robinson Okoli's Compound, Umudim Village, Ndikelionwu, Orumba North L.G.A, Anambra State
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                <div className="flex flex-col text-sm">
                  <a href="mailto:Info.rhrci@gmail.com" className="text-background/70 hover:text-background transition-colors">
                    Info.rhrci@gmail.com
                  </a>
                  <a href="mailto:rhrci.ng@gmail.com" className="text-background/70 hover:text-background transition-colors">
                    rhrci.ng@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                <div className="flex flex-col text-sm">
                  <a href="tel:07030789393" className="text-background/70 hover:text-background transition-colors">
                    07030789393
                  </a>
                  <a href="tel:08093312526" className="text-background/70 hover:text-background transition-colors">
                    08093312526
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm font-body">
            © {new Date().getFullYear()} Raising the Hope of Rural Children Initiative. All rights reserved.
          </p>
          <p className="text-background/60 text-sm font-body flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-heart-red fill-heart-red" /> for rural children
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
