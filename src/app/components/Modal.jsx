export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="big-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md relative">
                <div className="flex justify-center items-center flex-col">{children}</div>
            </div>
        </div>
    )
}