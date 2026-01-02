import logo from '../assets/logo_invite.png';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-4">
            <div className="relative">
                {/* Pulsing ring */}
                <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-75"></div>

                {/* Logo container */}
                <div className="relative bg-white p-6 rounded-full shadow-xl shadow-purple-100 border border-purple-50">
                    <img
                        src={logo}
                        alt="Loading..."
                        className="h-12 w-auto object-contain animate-pulse"
                    />
                </div>
            </div>

            <div className="mt-8 space-y-2 text-center">
                <h3 className="text-lg font-bold text-gray-900">Loading Invite</h3>
                <div className="flex gap-1 justify-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}
