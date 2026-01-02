import {
    Clock,
    ArrowRight,
    Bell,
    Zap,
    Share2,
    ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_invite.png";

export default function Home() {
    return (
        <div className="min-h-screen bg-white selection:bg-purple-100 selection:text-purple-900">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-12 bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center">
                    <img
                        src={logo}
                        alt="Invite Logo"
                        className="h-10 md:h-12 w-auto object-contain"
                    />
                </div>

                <div className="hidden md:flex items-center gap-10">
                    <a
                        href="#features"
                        className="text-gray-600 hover:text-purple-600 font-semibold transition-all hover:scale-105"
                    >
                        Features
                    </a>
                    <Link
                        to="/privacy-policy"
                        className="text-gray-600 hover:text-purple-600 font-semibold transition-all hover:scale-105"
                    >
                        Privacy
                    </Link>
                    <Link
                        to="/login"
                        className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all hover:shadow-2xl hover:shadow-purple-200 active:scale-95 flex items-center gap-2"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Mobile Menu Button (Simplified for now) */}
                <div className="md:hidden">
                    <Link
                        to="/login"
                        className="p-2 bg-purple-50 text-purple-600 rounded-xl"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative px-6 pt-16 pb-24 md:px-12 md:pt-28 md:pb-40 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100/50 rounded-full blur-[120px]" />
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-lime-100/30 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-6xl mx-auto text-center space-y-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-bold border border-purple-100 animate-bounce">
                        <Zap className="w-4 h-4" />
                        New: Automated Calendar Sync
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tight leading-[1.1]">
                        Scheduling made <br />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-600 via-fuchsia-500 to-cyan-500">
                            vibrant & simple
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                        Invite empowers you to create custom meeting templates, share
                        booking links instantly, and keep everyone in sync with automated
                        notifications.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-10 py-5 bg-purple-600 text-white rounded-4xl font-black text-xl hover:bg-purple-700 transition-all hover:shadow-2xl hover:shadow-purple-200 hover:-translate-y-1 flex items-center justify-center gap-3 group"
                        >
                            Start with Google
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-4xl font-bold text-xl hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm"
                        >
                            Explore Features
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                id="features"
                className="px-6 py-24 md:px-12 bg-gray-50/50 border-y border-gray-100"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900">
                            Why Choose Invite?
                        </h2>
                        <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">
                            We've built all the tools you need to manage your time without the
                            friction.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <Clock className="w-8 h-8 text-white" />,
                                color: "bg-purple-600",
                                title: "Custom Templates",
                                description:
                                    "Create limitless meeting templates with specific durations, availability windows, and custom descriptions.",
                            },
                            {
                                icon: <Share2 className="w-8 h-8 text-white" />,
                                color: "bg-cyan-500",
                                title: "Instant Sharing",
                                description:
                                    "Your unique booking URL is all you need. Recipients pick their time, fill the form, and you're done.",
                            },
                            {
                                icon: <Bell className="w-8 h-8 text-white" />,
                                color: "bg-lime-500",
                                title: "Smart Alerts",
                                description:
                                    "Real-time email and calendar invites for both parties ensures no meeting ever goes missed.",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-purple-200 transition-all hover:-translate-y-2"
                            >
                                <div
                                    className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}
                                >
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-24 md:px-12 overflow-hidden">
                <div className="max-w-6xl mx-auto bg-linear-to-br from-purple-600 via-fuchsia-600 to-indigo-600 rounded-[4rem] p-12 md:p-24 text-center text-white relative shadow-3xl shadow-purple-200">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -mr-48 -mt-48 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/30 rounded-full -ml-48 -mb-48 blur-3xl" />

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
                            Elevate your <br className="hidden md:block" /> scheduling
                            experience.
                        </h2>
                        <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto font-medium opacity-90">
                            Join thousands of users who trust Invite for their professional
                            and personal meetings.
                        </p>
                        <div className="pt-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-3 px-12 py-6 bg-white text-purple-600 rounded-[2.5rem] font-black text-2xl hover:bg-gray-50 transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
                            >
                                Get Started Free
                                <ArrowRight className="w-7 h-7" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-16 md:px-12 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
                        <img
                            src={logo}
                            alt="Invite Logo"
                            className="h-10 w-auto opacity-70 grayscale hover:grayscale-0 transition-all"
                        />

                        <div className="flex flex-wrap justify-center gap-10 text-gray-500 font-bold">
                            <Link
                                to="/privacy-policy"
                                className="hover:text-purple-600 transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms-of-service"
                                className="hover:text-purple-600 transition-colors"
                            >
                                Terms of Service
                            </Link>
                            <a
                                href="mailto:customerservice@heritagelaneco.com.au"
                                className="hover:text-purple-600 transition-colors"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-gray-50">
                        <p className="text-gray-400 text-sm font-medium">
                            © {new Date().getFullYear()} Invite. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-gray-400">
                            <ShieldCheck className="w-5 h-5 text-purple-400" />
                            <span className="text-sm font-bold">
                                Secure Google Authentication
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
