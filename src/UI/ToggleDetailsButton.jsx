export default function ToggleDetailsButton({ isOpen, onToggle}) {
  return (
    <button onClick={onToggle} className="mt-4 p-3 text-white rounded-lg hover:bg-white/20 transition-all duration-500" >
      {isOpen ? "Hide details ↑" : "View more ↓"}
    </button>
  );
}
