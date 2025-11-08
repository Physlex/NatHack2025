
export default function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark ${className}`}
    >
      {children}
    </button>
  )
}
