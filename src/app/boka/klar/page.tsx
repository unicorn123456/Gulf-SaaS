export default function BookingSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tack för din bokning!</h1>
        <p className="text-sm text-gray-500 mb-6">
          Din tid är bekräftad och din deposition är betald. Du får en bekräftelse via e-post inom kort.
        </p>
        <p className="text-xs text-gray-400">Drivs av VårdAI</p>
      </div>
    </div>
  );
}