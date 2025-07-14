// import { useState, useEffect } from "react";

// const SORT_OPTIONS = {
//   createdAt: "Most Recent",
//   viewCount: "Most Popular",
//   cookTime: "Cooking Time",
// };

// export default function FilterBar({ filters, setFilters, sort, setSort }) {
//   const [showSortOptions, setShowSortOptions] = useState(false);
//   const [openDropdownGroup, setOpenDropdownGroup] = useState(null);
//   const [filterOptions, setFilterOptions] = useState(null);

//   useEffect(() => {
//     const fetchFilters = async () => {
//       const endpoints = {
//         categories: "https://letmecook.ca/api/categories",
//         cuisines: "https://letmecook.ca/api/cuisines",
//         dietaryPreferences: "https://letmecook.ca/api/dietary-preferences",
//       };

//       const results = await Promise.all(
//         Object.entries(endpoints).map(async ([key, url]) => {
//           const res = await fetch(url);
//           const data = await res.json();
//           return [
//             key,
//             data.map((item) => ({
//               label: capitalize(item.name),
//               value: item.name,
//             })),
//           ];
//         })
//       );

//       const dynamicFilters = Object.fromEntries(results);

//       setFilterOptions({
//         categories: { label: "Category", options: dynamicFilters.categories },
//         cuisines: { label: "Cuisine", options: dynamicFilters.cuisines },
//         dietaryPreferences: {
//           label: "Diet",
//           options: dynamicFilters.dietaryPreferences,
//         },
//       });
//     };

//     const capitalize = (str) =>
//       str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

//     fetchFilters();
//   }, []);

//   const handleSelect = (group, value) => {
//     setFilters((prev) => {
//       const isSelected = prev[group].includes(value);
//       return {
//         ...prev,
//         [group]: isSelected
//           ? prev[group].filter((v) => v !== value)
//           : [...prev[group], value],
//       };
//     });
//   };

//   if (!filterOptions) return <div>Loading filters...</div>;

//   return (
//     <div className="filter-bar">
//       <div className="filter-top-row">
//         <div className="filter-dropdowns">
//           {Object.entries(filterOptions).map(([group, { label, options }]) => (
//             <div
//               key={group}
//               className="dropdown"
//               onMouseEnter={() => setOpenDropdownGroup(group)}
//               onMouseLeave={() => setOpenDropdownGroup(null)}
//             >
//               <div className="dropdown-button-wrapper">
//                 <button className="dropdown-button">
//                   <span>{label}</span>
//                   <svg
//                     className="dropdown-arrow-1"
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="9"
//                     height="6"
//                     viewBox="0 0 9 6"
//                     fill="none"
//                   >
//                     <path
//                       d="M4.8275 5.34775L0.769531 0.0512695H8.88547L4.8275 5.34775Z"
//                       fill="#1E1E1E"
//                     />
//                   </svg>
//                 </button>
//                 {filters[group]?.length > 0 && (
//                   <span className="dropdown-count-badge">
//                     {filters[group].length}
//                   </span>
//                 )}
//               </div>
//               {openDropdownGroup === group && (
//                 <div className="dropdown-content">
//                   {options.map(({ label: optLabel, value }) => (
//                     <div
//                       key={value}
//                       className="dropdown-item"
//                       onClick={() => {
//                         handleSelect(group, value);
//                         setOpenDropdownGroup(null);
//                       }}
//                     >
//                       <span>{optLabel}</span>
//                       {filters[group]?.includes(value) && (
//                         <span className="checkmark">
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             height="16px"
//                             viewBox="0 -960 960 960"
//                             width="16px"
//                             fill="#1e1e1e"
//                           >
//                             <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
//                           </svg>
//                         </span>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="sort-by">
//           <div
//             className="sort-hover-wrapper"
//             onMouseEnter={() => setShowSortOptions(true)}
//             onMouseLeave={() => setShowSortOptions(false)}
//           >
//             <div className="sort-label-wrapper">
//               <span className="sort-label">
//                 {SORT_OPTIONS[sort] || "Most Recent"}
//               </span>
//               <svg
//                 className="dropdown-arrow"
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="9"
//                 height="6"
//                 viewBox="0 0 9 6"
//                 fill="none"
//               >
//                 <path
//                   d="M4.8275 5.34775L0.769531 0.0512695H8.88547L4.8275 5.34775Z"
//                   fill="#1E1E1E"
//                 />
//               </svg>
//             </div>

//             {showSortOptions && (
//               <div className="sort-options-dropdown">
//                 {Object.entries(SORT_OPTIONS).map(([value, label]) => (
//                   <div
//                     key={value}
//                     className={`sort-dropdown-item ${
//                       sort === value ? "selected" : ""
//                     }`}
//                     onClick={() => {
//                       setSort(value);
//                       setShowSortOptions(false);
//                     }}
//                   >
//                     <span>{label}</span>
//                     {sort === value && (
//                       <span className="checkmark">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           height="16px"
//                           viewBox="0 -960 960 960"
//                           width="16px"
//                           fill="#1e1e1e"
//                         >
//                           <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
//                         </svg>
//                       </span>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="selected-filters">
//         {Object.entries(filters).flatMap(([group, values]) =>
//           values.map((value) => (
//             <button
//               key={`${group}-${value}`}
//               className="filter-tag"
//               onClick={() =>
//                 setFilters((prev) => ({
//                   ...prev,
//                   [group]: prev[group].filter((v) => v !== value),
//                 }))
//               }
//             >
//               {value.charAt(0).toUpperCase() + value.slice(1)}&nbsp;&nbsp;x
//             </button>
//           ))
//         )}
//         {Object.values(filters).some((arr) => arr.length > 0) && (
//           <button
//             className="clear-all"
//             onClick={() =>
//               setFilters({
//                 categories: [],
//                 cuisines: [],
//                 dietaryPreferences: [],
//               })
//             }
//           >
//             Clear All
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";

const SORT_OPTIONS = {
  createdAt: "Most Recent",
  viewCount: "Most Popular",
  cookTime: "Cooking Time",
};

export default function FilterBar({ filters, setFilters, sort, setSort }) {
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [openDropdownGroup, setOpenDropdownGroup] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);

  useEffect(() => {
    const fetchFilters = async () => {
      const endpoints = {
        categories: "https://letmecook.ca/api/categories",
        cuisines: "https://letmecook.ca/api/cuisines",
        dietaryPreferences: "https://letmecook.ca/api/dietary-preferences",
      };

      const results = await Promise.all(
        Object.entries(endpoints).map(async ([key, url]) => {
          const res = await fetch(url);
          const data = await res.json();
          return [
            key,
            data.map((item) => ({
              label: capitalize(item.name),
              value: item.name,
            })),
          ];
        })
      );

      const dynamicFilters = Object.fromEntries(results);

      setFilterOptions({
        categories: { label: "Category", options: dynamicFilters.categories },
        cuisines: { label: "Cuisine", options: dynamicFilters.cuisines },
        dietaryPreferences: {
          label: "Diet",
          options: dynamicFilters.dietaryPreferences,
        },
      });
    };

    const capitalize = (str) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    fetchFilters();
  }, []);

  const handleSelect = (group, value) => {
    setFilters((prev) => {
      const isSelected = prev[group].includes(value);
      return {
        ...prev,
        [group]: isSelected
          ? prev[group].filter((v) => v !== value)
          : [...prev[group], value],
      };
    });
  };

  if (!filterOptions) return <div>Loading filters...</div>;

  return (
    <div className="filter-bar">
      <div className="filter-top-row">
        <div className="filter-dropdowns">
          {Object.entries(filterOptions).map(([group, { label, options }]) => (
            <div key={group} className="dropdown">
              <div className="dropdown-button-wrapper">
                <button
                  className="dropdown-button"
                  onClick={() =>
                    setOpenDropdownGroup((prev) =>
                      prev === group ? null : group
                    )
                  }
                >
                  <span>{label}</span>
                  <svg
                    className="dropdown-arrow-1"
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
                </button>
                {filters[group]?.length > 0 && (
                  <span className="dropdown-count-badge">
                    {filters[group].length}
                  </span>
                )}
              </div>

              {openDropdownGroup === group && (
                <div className="dropdown-content scrollable">
                  {options.map(({ label: optLabel, value }) => (
                    <div
                      key={value}
                      className="dropdown-item"
                      onClick={() => {
                        handleSelect(group, value);
                      }}
                    >
                      <span>{optLabel}</span>
                      {filters[group]?.includes(value) && (
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
          ))}
        </div>

        <div className="sort-by">
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
      </div>

      <div className="selected-filters">
        {Object.entries(filters).flatMap(([group, values]) =>
          values.map((value) => (
            <button
              key={`${group}-${value}`}
              className="filter-tag"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  [group]: prev[group].filter((v) => v !== value),
                }))
              }
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}&nbsp;&nbsp;x
            </button>
          ))
        )}
        {Object.values(filters).some((arr) => arr.length > 0) && (
          <button
            className="clear-all"
            onClick={() =>
              setFilters({
                categories: [],
                cuisines: [],
                dietaryPreferences: [],
              })
            }
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
