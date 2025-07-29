export default function FormFieldRow({ label, field, value, onChange, error }) {
  return (
    <div className="flex gap-4">
      <label className="w-32 text-sm">
        {label} <span className="text-red-500">*</span>
      </label>
      <textarea
        className={`flex-1 bg-gray-700 rounded-lg p-2 h-[60px] custom-scrollbar resize-none ${
          error ? "border border-red-500" : ""
        }`}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
      />
    </div>
  );
}
