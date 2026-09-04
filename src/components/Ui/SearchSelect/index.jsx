import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "./SearchSelect.scss";

import InputField from "../InputField";

import ArrowDownUpIcon from "../../../assets/svg/chevron-down-up.svg?react";
import  CloseIcon from "../../../assets/svg/cross-icon.svg?react";


const SearchSelect = ({
    options = [],
    value = "",
    onSetValue,
    error,
    className = "",
    onFocus,
    placeholder = "Выбрать"
}) => {

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const wrapperRef = useRef(null);
    const optionRefs = useRef([]);
    const inputRef = useRef(null);

    const selectedOption = useMemo(() => {
        return options.find(option => option.value === value);
    }, [options, value]);

    const filteredOptions = useMemo(() => {

        const search = inputValue.trim().toLowerCase();

        if (!search)
            return options;

        return options.filter(option =>
            option.name.toLowerCase().includes(search)
        );

    }, [options, inputValue]);

    const resetValue = useCallback(() => {
        const search = inputValue.trim().toLowerCase();

        const exactOption = options.find(
            option => option.name?.trim().toLowerCase() === search
        );

        if (!exactOption) {
            if (value !== "" && value != null) {
                onSetValue?.("");
            }
            setInputValue("");
        } else if (exactOption.value !== value) {
            onSetValue?.(exactOption.value);
            setInputValue(exactOption.name);
        } else {
            setInputValue(exactOption.name);
        }

        setIsSearching(false);
        setHighlightedIndex(-1);
    }, [inputValue, options, onSetValue, value]);

    const closeSelect = useCallback(() => {
        setIsOpen(false);
        inputRef.current?.blur();
        resetValue();
    }, [resetValue]);

    useEffect(() => {
        const option = options.find(o => o.value === value);
        setInputValue(option?.name ?? "");
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!wrapperRef.current?.contains(e.target)) {
                closeSelect();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeSelect]);

    useEffect(() => {

        if (!isOpen) {
            setHighlightedIndex(-1);
            return;
        }

        setHighlightedIndex(filteredOptions.length ? 0 : -1);

    }, [isOpen, filteredOptions]);

    useEffect(() => {

        if (highlightedIndex < 0) return;

        optionRefs.current[highlightedIndex]?.scrollIntoView({
            block: "nearest"
        });

    }, [highlightedIndex]);

    const handleChange = (e) => {
        setInputValue(e.target.value);
        setIsSearching(true);

        if (!isOpen)
            setIsOpen(true);
    };

    const handleSelect = (option) => {
        onSetValue(option.value);
        setInputValue(option.name);
        setIsSearching(false);
        setHighlightedIndex(-1);
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {

        switch (e.key) {

            case "ArrowDown":
                e.preventDefault();

                if (!isOpen) {
                    setIsOpen(true);
                    return;
                }

                setHighlightedIndex(prev =>
                    prev >= filteredOptions.length - 1 ? 0 : prev + 1
                );

                break;

            case "ArrowUp":
                e.preventDefault();

                if (!isOpen) {
                    setIsOpen(true);
                    return;
                }

                setHighlightedIndex(prev =>
                    prev <= 0 ? filteredOptions.length - 1 : prev - 1
                );

                break;

            case "Enter":

                if (
                    isOpen &&
                    highlightedIndex >= 0 &&
                    filteredOptions[highlightedIndex]
                ) {
                    e.preventDefault();
                    handleSelect(filteredOptions[highlightedIndex]);
                }

                break;

            case "Escape":
                closeSelect();
                break;

            default:
                break;
        }

    };

    const ShowSelected = !isSearching && selectedOption;
    const Icon = ShowSelected?.iconObject;

    return (
        <div
            ref={wrapperRef}
            className={`search_select ${ShowSelected ? className : ""} app-transition`}
        >
            <div className={`search_select_input ${error ? "incorrect_field" : ""} app-transition`}>
                {
                    ShowSelected?.iconObject ?

                        <div className={`search_select_icon ${className}`}>
                            <Icon/>
                        </div>
                    :
                        <></>
                }

                <InputField
                    ref={inputRef}
                    value={inputValue}
                    placeholder={placeholder}
                    onFocus={() => {
                        setIsOpen(true)
                        onFocus?.()
                    }}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                />

                <button
                    type="button"
                    className={`search_select_right_icon ${isOpen ? 'search_select_right_icon_close' : ''} app-transition`}
                    onMouseDown={(e) => {
                        e.preventDefault();

                        if (isOpen) {
                            onSetValue("");
                            setInputValue("");
                            setIsSearching(false);
                        } else {
                            setIsOpen(true);
                        }
                    }}
                >
                    {isOpen ? <CloseIcon/> : <ArrowDownUpIcon />}
                </button>

            </div>

            {isOpen && (
                <div className="search_select_list blurred float_section app-transition">

                    {filteredOptions.length ? (

                        filteredOptions.map((option, index) => (

                            <button
                                key={option._id}
                                ref={el => optionRefs.current[index] = el}
                                type="button"
                                className={`search_select_item ${option.className ?? ""} ${highlightedIndex === index ? "search_select_item_selected" : ""} app-transition`}
                                onMouseDown={() => handleSelect(option)}
                            >
                                {
                                    option.render?.() ?? (
                                        <>
                                            {option.iconObject && (
                                                <div className={`search_select_icon ${option.className ?? ""}`}>
                                                    <option.iconObject />
                                                </div>
                                            )}
                                            <p>{option.name}</p>
                                        </>
                                    )
                                }
                            </button>

                        ))

                    ) : (

                        <div className="search_select_empty">
                            <p>
                                Ничего не найдено
                            </p>
                        </div>

                    )}

                </div>
            )}

        </div>
    );
};

export default SearchSelect;