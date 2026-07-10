import "./Categories.scss";

import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AppContext } from '../../App';

import { CATEGORY_COLORS } from "../../styles/constants";

import { ReactComponent as CategoryIcon1 } from "../../assets/svg/categories/1.svg";
import { ReactComponent as CategoryIcon2 } from "../../assets/svg/categories/2.svg";
import { ReactComponent as CategoryIcon3 } from "../../assets/svg/categories/3.svg";
import { ReactComponent as CategoryIcon4 } from "../../assets/svg/categories/4.svg";
import { ReactComponent as RectRoundedIcon } from "../../assets/svg/rect-rounded.svg";

import { ReactComponent as EditIcon } from "../../assets/svg/edit.svg";
import { ReactComponent as DeleteIcon } from "../../assets/svg/delete.svg";
import { ReactComponent as ThreeDotsIcon } from "../../assets/svg/three-dots.svg";
import { ReactComponent as PlusIcon } from "../../assets/svg/plus-icon.svg";
import { ReactComponent as Redirect } from "../../assets/svg/redirect.svg";
import { ReactComponent as ArrowLeftIcon } from "../../assets/svg/arrow-left.svg";

import { getCategories, editCategory, deleteCategory, createCategory } from "../../api/categories.api";

import DangerButton from "../../components/Ui/DangerButton/index";
import Popup from "../../components/Ui/Popup/index";
import Loading from "../../components/Ui/Loading/index";
import SearchSelect from "../../components/Ui/SearchSelect/index";
import Category from "../../components/Category/index";
import InputField from "../../components/Ui/InputField/index";
import PrimaryButton from "../../components/Ui/PrimaryButton/index";
import ActionButton from "../../components/Ui/ActionButton/index";

const EditCategoryPage = ({ active_category, setActivePage }) => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useContext(AppContext);
    const [initialized, setInitialized] = useState(false);
    const [fetching, setFetching] = useState(false);

    const icons = [
        {
            id: 1,
        },
        {
            id: 2,
        },
        {
            id: 3,
        },
        {
            id: 4,
        }
    ];

    const [category, setCategory] = useState({
        name: "",
        icon: "",
        color: "",
        _id: ""
    });
    const [ fields, setFields ] = useState({
        name: "",
        icon: null,
        color: null,
        _id: ""
    });

    const fetchCategories = async () => {
        setIsLoading(true);

        const result = await getCategories();

        setIsLoading(false);

        if (result.status) {
            const preparedCategories = result.data.map((category) => {
                category.className = CATEGORY_COLORS[category.color]?.className ?? "";
                category.value = category._id;

                switch (category.icon) {
                    case 1:
                        category.iconObject = CategoryIcon1;
                        break;
                    case 2:
                        category.iconObject = CategoryIcon2;
                        break;
                    case 3:
                        category.iconObject = CategoryIcon3;
                        break;
                    case 4:
                        category.iconObject = CategoryIcon4;
                        break;
                    default:
                        category.iconObject = null;
                        break;
                }

                return category;
            });

            setCategories(preparedCategories);
        }
    };;

    useEffect(() => {        
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialized) return;
        if (!active_category || categories.length === 0) return;

        const selectedCategory = categories.find(
            category => category._id === active_category
        );

        if (selectedCategory) {
            setCategory(selectedCategory);
            setInitialized(true);
        }
    }, [active_category, categories, initialized]);

    useEffect(() => {
        setFields({
            name: category?.name ?? "",
            icon: category?.icon ?? null,
            color: category?.color ?? null,
            _id: category?._id ?? ""
        })
    }, [category]);

    const doSave = async () => {
        setFetching(true);
        const result = await editCategory(category._id, fields);
        setFetching(false);
        if (result.status) {
            const updatedCategory = {
                ...result.data,
                className: CATEGORY_COLORS[result.data.color]?.className ?? "",
                value: result.data._id
            };

            switch (updatedCategory.icon) {
                case 1:
                    updatedCategory.iconObject = CategoryIcon1;
                    break;
                case 2:
                    updatedCategory.iconObject = CategoryIcon2;
                    break;
                case 3:
                    updatedCategory.iconObject = CategoryIcon3;
                    break;
                case 4:
                    updatedCategory.iconObject = CategoryIcon4;
                    break;
                default:
                    updatedCategory.iconObject = null;
                    break;
            }

            setCategory(updatedCategory);

            setCategories(prev =>
                prev.map(category =>
                    category._id === updatedCategory._id
                        ? updatedCategory
                        : category
                )
            );

            showToast({
                type: "success",
                message: "Категория успешно обновлена!"
            });
        }
        else {
            showToast({
                type: "error",
                message: result.message
            });
        }
    };

    const popupColorBody = Object.values(CATEGORY_COLORS).map(color => ({
        title: color.name,
        id: color.id,
        onClick: () => setFields({ ...fields, color: color.id }),
        className: `${CATEGORY_COLORS[color.id].className}`,
        icon: <RectRoundedIcon className="..." />
    }))

    popupColorBody.push({
        title: "Без цвета",
        id: null,
        onClick: () => setFields({ ...fields, color: null }),
        className: "category_color_none",
        icon: <RectRoundedIcon className="..." />
    })

    return (
        <>
            <ActionButton className="admin_panel_content_categories_page_back" onClick={() => setActivePage('')}><ArrowLeftIcon className="app-transition" /> Назад</ActionButton>
            {
                isLoading ?
                    <Loading size={40}/>
                :
                    <div className="admin_panel_content_edit_categories_page">
                        <SearchSelect
                            input_label={"Категория"}
                            value={category?._id}
                            onSetValue={(value) =>{
                                setCategory( categories.find((category) => category._id === value));
                            }}
                            options={categories}
                            className={CATEGORY_COLORS[category?.color]?.className}
                        />
                        {
                            !category?.name && !category?.icon && !category?.color ?
                                <></>
                            :
                                <div className="admin_panel_content_edit_categories_page_settings app-transition">
                                    <InputField
                                        input_label={"Название"}
                                        placeholder={"Введите название категории"}
                                        value={fields?.name}
                                        onChange={(e) => setFields({...fields, name: e.target.value})}
                                    />
                                    <div classneame="admin_panel_content_edit_categories_page_settings_color">
                                        <Popup body={popupColorBody}>
                                            <div className={`admin_panel_content_edit_categories_page_settings_color`}>
                                                <p>Цвет</p>
                                                <div className="admin_panel_content_edit_categories_page_settings_color_content app-transition">
                                                    <div className={`admin_panel_content_edit_categories_page_settings_color_content_rect ${CATEGORY_COLORS[fields.color]?.className} app-transition`} >

                                                        <RectRoundedIcon/>
                                                    </div>
                                                    <p>{popupColorBody.find((c) => c.id === fields.color)?.title}</p>
                                                </div>
                                            </div>
                                        </Popup>
                                    </div>
                                    <div className={`admin_panel_content_edit_categories_page_settings_icon`}>
                                        <p>Иконка</p>
                                        <div className={`admin_panel_content_edit_categories_page_settings_icon_content app-transition`}>
        
                                            {
                                            icons.map((categoryItem, index) => (
                                                <div
                                                    key={`${categoryItem.id}-${index}`}
                                                    className={`admin_panel_content_edit_categories_page_settings_icon_content_item ${
                                                        categoryItem.id === fields.icon
                                                            ? "admin_panel_content_edit_categories_page_settings_icon_content_item_active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setFields({
                                                            ...fields,
                                                            icon: fields.icon === categoryItem.id ? null : categoryItem.id
                                                        })
                                                    }
                                                >
                                                    <Category category={{ icon: categoryItem.id }} onClick={() => {}} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <PrimaryButton is_loading={fetching} onClick={() => { doSave() }}>Сохранить</PrimaryButton>
                                </div>
                        }
                    </div>
            }
        </>
    )
}

const CreateCategoryPage = ({ setActivePage }) => {
    const { showToast } = useContext(AppContext);
    const [fetching, setFetching] = useState(false);
    const [errors, setErrors] = useState({});

    const icons = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 }
    ];

    const [fields, setFields] = useState({
        name: "",
        icon: null,
        color: null
    });

    const popupColorBody = [
        ...Object.values(CATEGORY_COLORS).map(color => ({
            id: color.id,
            title: color.name,
            className: color.className,
            icon: <RectRoundedIcon />,
            onClick: () =>
                setFields(prev => ({
                    ...prev,
                    color: color.id
                }))
        })),
        {
            id: null,
            title: "Без цвета",
            className: "category_color_none",
            icon: <RectRoundedIcon />,
            onClick: () =>
                setFields(prev => ({
                    ...prev,
                    color: null
                }))
        }
    ];

    const doCreate = async () => {
        setFetching(true);

        const result = await createCategory(fields);

        setFetching(false);

        if (result.status) {
            showToast({
                type: "success",
                message: "Категория успешно создана!"
            });

            setActivePage("");
        } else {
            setErrors(result.errors ?? {});
            showToast({
                type: "error",
                message: result.message
            });
        }
    };

    return (
        <>
            <ActionButton
                className="admin_panel_content_categories_page_back"
                onClick={() => setActivePage("")}
            >
                <ArrowLeftIcon className="app-transition" />
                Назад
            </ActionButton>

            <div className="admin_panel_content_edit_categories_page">

                <div className="admin_panel_content_edit_categories_page_settings app-transition">

                    <InputField
                        input_label="Название"
                        placeholder="Введите название категории"
                        onMouseDown={() => setErrors(prev => ({ ...prev, body: { ...prev.body, name: null } }))}
                        value={fields.name}
                        error={errors?.body?.name?.message}
                        onChange={(e) =>
                            setFields(prev => ({
                                ...prev,
                                name: e.target.value
                            }))
                        }
                    />

                    <Popup body={popupColorBody}>
                        <div className="admin_panel_content_edit_categories_page_settings_color">

                            <p>Цвет</p>

                            <div className="admin_panel_content_edit_categories_page_settings_color_content app-transition">

                                <div
                                    className={`admin_panel_content_edit_categories_page_settings_color_content_rect ${CATEGORY_COLORS[fields.color]?.className ?? ""}`}
                                >
                                    <RectRoundedIcon />
                                </div>

                                <p>
                                    {popupColorBody.find(c => c.id === fields.color)?.title}
                                </p>

                            </div>

                        </div>
                    </Popup>

                    <div className="admin_panel_content_edit_categories_page_settings_icon">

                        <p>Иконка</p>

                        <div className="admin_panel_content_edit_categories_page_settings_icon_content app-transition">

                            {icons.map(icon => (
                                <div
                                    key={icon.id}
                                    className={`admin_panel_content_edit_categories_page_settings_icon_content_item ${
                                        fields.icon === icon.id
                                            ? "admin_panel_content_edit_categories_page_settings_icon_content_item_active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setFields(prev => ({
                                            ...prev,
                                            icon: prev.icon === icon.id
                                                ? null
                                                : icon.id
                                        }))
                                    }
                                >
                                    <Category
                                        category={{ icon: icon.id }}
                                        onClick={() => {}}
                                    />
                                </div>
                            ))}

                        </div>

                    </div>

                    <PrimaryButton
                        is_loading={fetching}
                        onClick={doCreate}
                    >
                        Создать
                    </PrimaryButton>

                </div>

            </div>
        </>
    );
};

const HomeCategoryPage = ({ setActivePage, setActiveCategory }) => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast, showModalWindow, requestCloseModal } = useContext(AppContext);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        setIsLoading(true);
        const result = await getCategories();
        setIsLoading(false);
        if (result.status) {
            setCategories(result.data);
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const appRoot = document.getElementById("app-root");

    const getCategoryColor = (color) => {
        const variable = getComputedStyle(appRoot)
            .getPropertyValue(`--category-color-${color}`)
            .trim();
        if(variable === "") return "Без цвета";

        return variable;
    }

    const getDeleleteCategoryModalContent = (category, close_func) => {
        const requestDelete = async () => {
            const result = await deleteCategory(category._id);


            if (result.status) {
                showToast({
                    type: "success",
                    message: "Категория успешно удалена!"
                });
                requestCloseModal();
                fetchCategories();  
            }
            else {
                showToast({
                    type: "error",
                    message: result.message
                });
            }
        }

        return (
            <div className="admin_panel_content_categories_page_modal_window">
                <Category category={category} is_active={true} />
                <div className="admin_panel_content_categories_page_modal_window_bottom">
                    <ActionButton onClick={close_func}>Отмена</ActionButton>
                    <DangerButton onClick={() => { requestDelete(); }} is_active={true}>Удалить</DangerButton>
                </div>
            </div>
        )
    }

    const doDeleteCategory = async (category) => {
        showModalWindow({
            "title": "Вы уверены что хотите удалить категорию?",
            content: getDeleleteCategoryModalContent(category, requestCloseModal),
            show_close_button: false,
            close_func: () => {}
        })
    }

    return (
        <>
            <div className="admin_panel_content_categories_page">
                <PrimaryButton className="admin_panel_content_categories_page_create" onClick={() => setActivePage('create')}><PlusIcon className="app-transition" />Создать категорию</PrimaryButton>
                {
                    isLoading ?
                        <Loading size={40}/>
                    :
                        
                        categories?.map((category, index) => {
                            return(
                                <div className="admin_panel_content_categories_page_category app-transition" key={index}>
                                    <div className="admin_panel_content_categories_page_category_data">
                                        <Category onClick={() => {}} className="admin_panel_content_categories_page_category_data_icon" category={category} is_active={true} />
                                        <div className="admin_panel_content_categories_page_category_data_content">
                                            <p className="admin_panel_content_categories_page_category_data_content_name">{category?.name}</p>
                                            <div className="admin_panel_content_categories_page_category_data_content_color">
                                                <div className={`admin_panel_content_categories_page_category_data_content_color_circle ${CATEGORY_COLORS[category?.color]?.className} app-transition `}>
                                                </div>
                                                <p>
                                                    {getCategoryColor(category?.color)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="admin_panel_content_categories_page_category_posts_count">
                                        Постов: {category.posts_count}
                                    </p>
                                    <div className="admin_panel_content_categories_page_category_actions">
                                        <Popup
                                            body={[
                                                {
                                                    title: "Перейти к постам",
                                                    icon: <Redirect />,
                                                    onClick: () => { navigate(`/posts?filter=${category._id}`) },
                                                },
                                                {
                                                    title: "Редактировать",
                                                    icon: <EditIcon />,
                                                    onClick: () => {
                                                        setActiveCategory(category._id)
                                                        setActivePage('edit')
                                                    },
                                                },
                                                {
                                                    title: "Удалить",
                                                    icon: <DeleteIcon />,
                                                    type: "danger",
                                                    onClick: () => { doDeleteCategory(categories.find(c => c._id === category._id)) },
                                                }
                                            ]}
                                        >

                                            <ThreeDotsIcon className="app-transition"/>
                                        </Popup>
                                    </div>
                                </div>
                            )
                        })
                }
            </div>
        </>
    )
}

const CategoriesPage = () => {
    const [activePage, setActivePage] = useState('');
    const [activeCategory, setActiveCategory] = useState('');

    return (() => {
        switch (activePage) {
            case 'edit':
                return <EditCategoryPage active_category={activeCategory} setActivePage={setActivePage} />;
            case 'create':
                return <CreateCategoryPage setActivePage={setActivePage} />;
            default:
                return <HomeCategoryPage setActivePage={setActivePage} setActiveCategory={setActiveCategory} />
        }
    })();
}

export default CategoriesPage;