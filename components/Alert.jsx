import Image from "next/image";

export default function Alert({ show, onClose, msg }) {
    const handleClose = () => {
        onClose && onClose()
    }
    return <div>
        {show && (
            <div className="fixed inset-0 bg-black opacity-50 z-10"></div>
            )}
            {show && (
                <div
                    className="w-10/12 md:w-auto fixed left-1/2 top-0 mt-36 px-8 md:px-16 pt-5 pb-5
                        transform -translate-x-1/2 rounded-md z-20"
                    style={{ backgroundColor: 'rgb(248,242,228)' }}
                >
                    <div
                        className="absolute top-2 right-2 w-8 h-8 cursor-pointer"
                        onClick={handleClose}
                    >
                        <Image src="/btn-close.png" unoptimized layout="fill" />
                    </div>

                    <div
                        className="py-10 text-xl md:text-2xl text-gray-400 text-center"
                        style={{ color: 'rgb(91,50,25)' }}
                    >
                        {msg}
                    </div>
                </div>
            )}
        </div>
}
