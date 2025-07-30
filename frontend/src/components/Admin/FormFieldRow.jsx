export default function FormFieldRow({ label, field, value, onChange, error }) {
  return (
    <div className="flex sm:gap-4">
      <label className="sm:w-32 w-26 text-sm">
        {label} <span className="text-red-500">*</span>
      </label>
      <textarea
        className={`flex-1 bg-gray-700 rounded-lg p-2 h-[55px] custom-scrollbar resize-none ${
          error ? "border border-red-500" : ""
        }`}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
      />
    </div>
  );
}
