import { useEffect, useMemo, useRef, useState } from "react";
import "./SearchSelect.scss";

import InputField from "../InputField";
import { ReactComponent as ArrowDownUpIcon } from "../../../assets/svg/arrow-down-up.svg";

import { getCategoryColorType } from "../../../utils/format";

const SearchSelect = ({
    options = [],
    value = "",
    onSetValue,
    error,
    input_label,
    placeholder = "Выбрать"
}) => {

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const wrapperRef = useRef(null);
    const optionRefs = useRef([]);

    const selectedOption = useMemo(() => {
        return options.find(
            c => c.name?.toLowerCase() === value?.toLowerCase()
        );
    }, [options, value]);

    const filteredOptions = useMemo(() => {
        const search = inputValue.trim().toLowerCase();

        if (!search) return options;

        return options.filter(option =>
            option.name.toLowerCase().includes(search)
        );
    }, [options, inputValue]);

    useEffect(() => {
        const opt = options.find(
            c => c.name?.toLowerCase() === value?.toLowerCase()
        );

        setInputValue(opt?.name || value || "");
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);

                const opt = options.find(
                    c => c.name?.toLowerCase() === value?.toLowerCase()
                );

                setInputValue(opt?.name || value || "");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [options, value]);

    const handleChange = (e) => {
        setInputValue(e.target.value);
        setIsOpen(true);
    };

    const handleSelect = (option) => {
        onSetValue?.(option.name);
        setInputValue(option.name);
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            setIsOpen(false);

            const opt = options.find(
                c => c.name?.toLowerCase() === value?.toLowerCase()
            );

            setInputValue(opt?.name || value || "");
        }
    };

    return (
        <div ref={wrapperRef} className={`search_select search_select_type_${getCategoryColorType(selectedOption?.name)} app-transition`}>
            <p className="search_select_label">{input_label}</p>

            <div className="search_select_input">

                {selectedOption?.icon && (
                    <div
                        className={`search_select_icon category_type_${getCategoryColorType(selectedOption?.name)}`}
                        dangerouslySetInnerHTML={{
                            __html: selectedOption.icon
                        }}
                    />
                )}

                <InputField
                    value={inputValue}
                    placeholder={placeholder}
                    error={error}
                    onChange={handleChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />

                <button
                    type="button"
                    className="search_select_arrow"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setIsOpen(prev => !prev);
                    }}
                >
                    <ArrowDownUpIcon />
                </button>
            </div>

            {isOpen && (
                <div className="search_select_list app-transition blurred">
                    {filteredOptions.length ? (
                        filteredOptions.map((option, index) => (
                            <button
                                key={option._id}
                                ref={el => optionRefs.current[index] = el}
                                type="button"
                                className={`search_select_item category_type_${getCategoryColorType(option.name)} app-transition`}
                                onMouseDown={() => handleSelect(option)}
                            >
                                {option.icon && (
                                    <div
                                        className="search_select_item_icon"
                                        dangerouslySetInnerHTML={{
                                            __html: option.icon
                                        }}
                                    />
                                )}

                                <p>{option.name}</p>
                            </button>
                        ))
                    ) : (
                        <div className="search_select_empty">
                            Ничего не найдено
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchSelect;