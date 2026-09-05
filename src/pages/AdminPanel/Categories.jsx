import "./Categories.scss";

import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AppContext } from '../../App';

import { CATEGORY_COLORS } from "../../styles/constants";

import CategoryIcon1 from "../../assets/svg/categories/1.svg?react";
import CategoryIcon2 from "../../assets/svg/categories/2.svg?react";
import CategoryIcon3 from "../../assets/svg/categories/3.svg?react";
import CategoryIcon4 from "../../assets/svg/categories/4.svg?react";
import CategoryIcon5 from "../../assets/svg/categories/5.svg?react";
import CategoryIcon6 from "../../assets/svg/categories/6.svg?react";
import CategoryIcon7 from "../../assets/svg/categories/7.svg?react";
import CategoryIcon8 from "../../assets/svg/categories/8.svg?react";
import CategoryIcon9 from "../../assets/svg/categories/9.svg?react";
import CategoryIcon10 from "../../assets/svg/categories/10.svg?react";
import CategoryIcon11 from "../../assets/svg/categories/11.svg?react";
import CategoryIcon12 from "../../assets/svg/categories/12.svg?react";
import CategoryIcon13 from "../../assets/svg/categories/13.svg?react";
import CategoryIcon14 from "../../assets/svg/categories/14.svg?react";
import CategoryIcon15 from "../../assets/svg/categories/15.svg?react";
import CategoryIcon16 from "../../assets/svg/categories/16.svg?react";
import CategoryIcon17 from "../../assets/svg/categories/17.svg?react";
import CategoryIcon18 from "../..//assets/svg/categories/18.svg?react";
import CategoryIcon19 from "../../assets/svg/categories/19.svg?react";
import CategoryIcon20 from "../../assets/svg/categories/20.svg?react";
import CategoryIcon21 from "../../assets/svg/categories/21.svg?react";
import CategoryIcon22 from "../../assets/svg/categories/22.svg?react";
import CategoryIcon23 from "../../assets/svg/categories/23.svg?react";
import CategoryIcon24 from "../../assets/svg/categories/24.svg?react";
import CategoryIcon25 from "../../assets/svg/categories/25.svg?react";
import CategoryIcon26 from "../../assets/svg/categories/26.svg?react";

import RectRoundedIcon from "../../assets/svg/rect-rounded.svg?react";

import EditIcon from "../../assets/svg/edit.svg?react";
import DeleteIcon from "../../assets/svg/delete.svg?react";
import ThreeDotsIcon from "../../assets/svg/three-dots.svg?react";
import PlusIcon from "../../assets/svg/plus-icon.svg?react";
import Redirect from "../../assets/svg/redirect.svg?react";
import ArrowLeftIcon from "../../assets/svg/arrow-left.svg?react";

import { getCategories, editCategory, deleteCategory, createCategory } from "../../api/categories.api";

import DangerButton from "../../components/Ui/DangerButton/index";
import Popup from "../../components/Ui/Popup/index";
import Loading from "../../components/Ui/Loading/index";
import SearchSelect from "../../components/Ui/SearchSelect/index";
import Category from "../../components/Category/index";
import InputField from "../../components/Ui/InputField/index";
import PrimaryButton from "../../components/Ui/PrimaryButton/index";
import ActionButton from "../../components/Ui/ActionButton/index";
import Field from "../../components/Ui/Field/index";

const categoryIcons = {
    1: CategoryIcon1,
    2: CategoryIcon2,
    3: CategoryIcon3,
    4: CategoryIcon4,
    5: CategoryIcon5,
    6: CategoryIcon6,
    7: CategoryIcon7,
    8: CategoryIcon8,
    9: CategoryIcon9,
    10: CategoryIcon10,
    11: CategoryIcon11,
    12: CategoryIcon12,
    13: CategoryIcon13,
    14: CategoryIcon14,
    15: CategoryIcon15,
    16: CategoryIcon16,
    17: CategoryIcon17,
    18: CategoryIcon18,
    19: CategoryIcon19,
    20: CategoryIcon20,
    21: CategoryIcon21,
    22: CategoryIcon22,
    23: CategoryIcon23,
    24: CategoryIcon24,
    25: CategoryIcon25,
    26: CategoryIcon26,
};

const EditCategoryPage = ({ active_category, setActivePage }) => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useContext(AppContext);
    const [initialized, setInitialized] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [errors, setErrors] = useState({});

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

                category.iconObject = categoryIcons[category.icon];

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

            updatedCategory.iconObject = categoryIcons[updatedCategory.icon];


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
            setErrors(result.errors ?? {});

            showToast({
                type: "error",
                message: "Ошибка при обновлении категории!"
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
                                    <Field error={errors?.body?.name?.message} title={"Название"}>
                                        <InputField
                                            placeholder={"Введите название категории"}
                                            value={fields?.name}
                                            error={errors?.body?.name?.message}
                                            onMouseDown={() => setErrors(prev => ({ ...prev, body: { ...prev.body, name: null } }))}
                                            onChange={(e) => setFields({...fields, name: e.target.value})}
                                        />
                                    </Field>
                                    <div classneame="admin_panel_content_edit_categories_page_settings_color">
                                        <Popup body={popupColorBody}>
                                            <div className={`admin_panel_content_edit_categories_page_settings_color`}>
                                                <Field title={"Цвет"} error={errors?.body?.color?.message}>
                                                    <div className="admin_panel_content_edit_categories_page_settings_color_content app-transition">
                                                        <div className={`admin_panel_content_edit_categories_page_settings_color_content_rect ${CATEGORY_COLORS[fields.color]?.className} app-transition`} >
                                                            <RectRoundedIcon/>
                                                        </div>
                                                        <p>{popupColorBody.find((c) => c.id === fields.color)?.title}</p>
                                                    </div>
                                                </Field>
                                            </div>
                                        </Popup>
                                    </div>
                                    <div className={`admin_panel_content_edit_categories_page_settings_icon`}>
                                        <p>Иконка</p>
                                        <div className={`admin_panel_content_edit_categories_page_settings_icon_content app-transition`}>
        
                                            {Object.entries(categoryIcons).map(([id]) => {
                                                id = Number(id);

                                                return (
                                                    <div
                                                        key={id}
                                                        className={`admin_panel_content_edit_categories_page_settings_icon_content_item ${
                                                            fields.icon === id
                                                                ? "admin_panel_content_edit_categories_page_settings_icon_content_item_active"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            setFields(prev => ({
                                                                ...prev,
                                                                icon: prev.icon === id ? null : id
                                                            }))
                                                        }
                                                    >
                                                        <Category category={{ icon: id }} onClick={() => {}} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <PrimaryButton isLoading={fetching} onClick={() => { doSave() }}>Сохранить</PrimaryButton>
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
                message: "Ошибка при создании категории!"
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

                    <Field error={errors?.body?.name?.message} title={"Название"}>
                        <InputField
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
                    </Field>

                    <Popup body={popupColorBody}>
                        <div className="admin_panel_content_edit_categories_page_settings_color">
                            <Field error={errors?.body?.color?.message} title={"Цвет"}>
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
                            </Field>

                        </div>
                    </Popup>

                    <div className="admin_panel_content_edit_categories_page_settings_icon">

                        <p>Иконка</p>

                        <div className="admin_panel_content_edit_categories_page_settings_icon_content app-transition">

                            {Object.entries(categoryIcons).map(([id]) => {
                                id = Number(id);

                                return (
                                    <div
                                        key={id}
                                        className={`admin_panel_content_edit_categories_page_settings_icon_content_item ${
                                            fields.icon === id
                                                ? "admin_panel_content_edit_categories_page_settings_icon_content_item_active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setFields(prev => ({
                                                ...prev,
                                                icon: prev.icon === id ? null : id
                                            }))
                                        }
                                    >
                                        <Category category={{ icon: id }} onClick={() => {}} />
                                    </div>
                                );
                            })}

                        </div>

                    </div>

                    <PrimaryButton
                        isLoading={fetching}
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

    const getDeleleteCategoryModalContent = (category, closeModal) => {
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
                <Category category={category} isActive={true} />
                <div className="admin_panel_content_categories_page_modal_window_bottom">
                    <ActionButton onClick={closeModal}>Отмена</ActionButton>
                    <DangerButton onClick={() => { requestDelete(); }} isActive={true}>Удалить</DangerButton>
                </div>
            </div>
        )
    }

    const doDeleteCategory = async (category) => {
        showModalWindow({
            "title": "Вы уверены что хотите удалить категорию?",
            content: getDeleleteCategoryModalContent(category, requestCloseModal),
            showCloseButton: false,
            closeFunc: () => {}
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
                                        <Category onClick={() => {}} className="admin_panel_content_categories_page_category_data_icon" category={category} isActive={true} />
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