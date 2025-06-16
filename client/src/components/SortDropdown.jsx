import { useState } from "react";

const SORT_OPTIONS = {
  createdAt: "Most Recent",
  viewCount: "Most Popular",
  cookTime: "Cooking Time",
};

export default function SortDropdown({ sort, setSort }) {
  const [showSortOptions, setShowSortOptions] = useState(false);

  return (
    <div
      className="sort-bar"
      style={{ display: "flex", justifyContent: "flex-end" }}
    >
      <div
        className="sort-hover-wrapper"
        onMouseEnter={() => setShowSortOptions(true)}
        onMouseLeave={() => setShowSortOptions(false)}
      >
        <div className="sort-label-wrapper">
          <span className="sort-label">
            {SORT_OPTIONS[sort] || "Most Recent"}
          </span>
          <svg
            className="dropdown-arrow"
            xmlns="http://www.w3.org/2000/svg"
            width="9"
            height="6"
            viewBox="0 0 9 6"
            fill="none"
          >
            <path
              d="M4.8275 5.34775L0.769531 0.0512695H8.88547L4.8275 5.34775Z"
              fill="#1E1E1E"
            />
          </svg>
        </div>

        {showSortOptions && (
          <div className="sort-options-dropdown">
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <div
                key={value}
                className={`sort-dropdown-item ${
                  sort === value ? "selected" : ""
                }`}
                onClick={() => {
                  setSort(value);
                  setShowSortOptions(false);
                }}
              >
                <span>{label}</span>
                {sort === value && (
                  <span className="checkmark">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="16px"
                      viewBox="0 -960 960 960"
                      width="16px"
                      fill="#1e1e1e"
                    >
                      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
