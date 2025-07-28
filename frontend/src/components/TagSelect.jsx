import CreatableSelect from "react-select/creatable";

export default function TagSelect({
  selectedTags = [],
  allTags = [],
  onChange,
  error = false,
}) {
  const options = allTags.map((tag) => ({ value: tag, label: tag }));
  const value = selectedTags.map((tag) => ({ value: tag, label: tag }));

  const handleChange = (selectedOptions) => {
    const tags = (selectedOptions || []).map((opt) => opt.value);
    onChange(tags);
  };

  return (
    <CreatableSelect
      isMulti
      isClearable
      closeMenuOnSelect={false}
      value={value}
      onChange={handleChange}
      options={options}
      className="w-full"
      menuPortalTarget={document.body}
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "#1f2937", // gray-800
          borderColor: error
            ? "#f87171" // red
            : state.isFocused
              ? "#7e22ce"
              : "#4b5563", // gray-600
          borderRadius: "0.5rem", // rounded-xl
          boxShadow: "none",
          padding: "2px 4px",
          minHeight: "38px",
        }),
        valueContainer: (base) => ({
          ...base,
          padding: "2px 6px",
        }),
        input: (base) => ({
          ...base,
          color: "white",
          margin: 0,
          padding: 0,
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "#1f2937", // gray-800
          color: "white",
          zIndex: 9999,
          borderRadius: "0.5rem",
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected
            ? "#7e22ce"
            : isFocused
              ? "#4b5563"
              : "transparent",
          color: "white",
          padding: "6px 12px",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "#6B21A8", // purple-800
          borderRadius: "0.375rem",
          padding: "2px 4px",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "white",
          fontSize: "0.85rem",
          padding: "0 4px",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "white",
          padding: "0 4px",
          ":hover": {
            backgroundColor: "#7e22ce",
            color: "white",
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: "white",
        }),
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
      }}
      components={{
        MenuList: (props) => (
          <div
            className="custom-scrollbar"
            style={{ maxHeight: "150px", overflowY: "auto" }}
          >
            {props.children}
          </div>
        ),
      }}
    />
  );
}
