export default function Loading() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-[#E5E2DC] overflow-hidden"
      role="progressbar"
      aria-label="Memuat halaman"
    >
      <div className="route-progress h-full w-full bg-[#D97706]" />
    </div>
  )
}
