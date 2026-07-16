export const dajSelectStyle = {
    control: (base, state) => ({
        ...base,
        minHeight: "44px",
        borderRadius: "8px",
        borderColor: state.isFocused
            ? "var(--primary-color)"
            : "var(--border-color)",
        boxShadow: "none",
        backgroundColor: "var(--white-color)",
        "&:hover": {
            borderColor: "var(--primary-color)",
        },
    }),

    menu: (base) => ({
        ...base,
        zIndex: 9999,
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),

    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "var(--primary-color)"
            : state.isFocused
                ? "var(--primary-light-color)"
                : "var(--white-color)",
        color: state.isSelected
            ? "var(--white-color)"
            : "var(--text-color)",
        cursor: "pointer",
    }),

    singleValue: (base) => ({
        ...base,
        color: "var(--text-color)",
    }),

    placeholder: (base) => ({
        ...base,
        color: "var(--text-light-color)",
    }),
};