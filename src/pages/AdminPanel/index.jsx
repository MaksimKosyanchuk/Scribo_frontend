import "./AdminPanel.scss";

import { useEffect, useState, useContext } from "react";
import { AppContext } from '../../App';
import { useNavigate } from "react-router-dom";

import { ReactComponent as CategoryIcon1 } from "../../assets/svg/categories/1.svg";
import { ReactComponent as CategoryIcon2 } from "../../assets/svg/categories/2.svg";
import { ReactComponent as CategoryIcon3 } from "../../assets/svg/categories/3.svg";
import { ReactComponent as CategoryIcon4 } from "../../assets/svg/categories/4.svg";
import { ReactComponent as RectRoundedIcon } from "../../assets/svg/rect-rounded.svg";
import { ReactComponent as AdminPanelIcon } from "../../assets/svg/home-icon.svg";

import { getCategories, editCategory } from "../../api/categories.api";

import Popup from "../../components/Ui/Popup/index";
import Loading from "../../components/Ui/Loading/index";
import SearchSelect from "../../components/Ui/SearchSelect/index";
import Category from "../../components/Category/index";
import InputField from "../../components/Ui/InputField/index";
import PrimaryButton from "../../components/Ui/PrimaryButton/index";

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useContext(AppContext);

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
        },
    ];

    const [category, setCategory] = useState({
        name: "",
        icon: "",
        color: "",
        _id: ""
    });
    const [ fields, setFields ] = useState({
        name: "",
        icon: "",
        color: "",
        _id: ""
    });

    const navigate = useNavigate();
    
    const fetchCategories = async () => {
        setIsLoading(true);
        const result = await getCategories();
        setIsLoading(false);
        if(result.status) {
            for(const category of result.data) {
                category.className = `item_category_type_${category?.color}`
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
                }
            }
            setCategories(result.data);
        }
    };

    useEffect(() => {    
        fetchCategories();
    }, []);

    useEffect(() => {
        setFields({
            name: category?.name ?? "",
            icon: category?.icon ?? "",
            color: category?.color ?? "",
            _id: category?._id ?? ""
        })
    }, [category]);

    const doSave = async () => {
        const result = await editCategory(category._id, fields);
        console.log(result);
        if(result.status) {
            fetchCategories();
            setCategory(result.data);
            showToast({type: "success", message: "Категория успешно обновлена!"})
        }
        else {
            showToast({type: "error", message: "Ошибка при обновлении категории!"})
        }
    }

    return (
        isLoading ?
            <Loading size={40}/>
        :
            
            <div className="admin_panel_content_categories_page">
                <SearchSelect
                    input_label={"Категория"}
                    value={category?._id}
                    onSetValue={(value) =>{
                        setCategory( categories.find((category) => category._id === value));
                    }}
                    options={categories}
                    className={`category_type_${category?.color}`}
                />
                {
                    !category?.name && !category?.icon && !category?.color ?
                        <></>
                    :
                        <div className="admin_panel_content_categories_page_settings app-transition">
                            <div>
                                <p>Постов: {category?.posts_count}</p>
                            </div>
                            <InputField
                                input_label={"Название"}
                                placeholder={"Введите название категории"}
                                value={fields?.name}
                                onChange={(e) => setFields({...fields, name: e.target.value})}
                            />
                            <div classneame="admin_panel_content_categories_page_settings_color">
                                <Popup
                                    body={[
                                        {
                                            title: "Зеленый",
                                            onclick: () => setFields({...fields, color: 1}),
                                            className: "admin_panel_content_categories_page_settings_color_category_1",
                                            icon: <RectRoundedIcon className="admin_panel_content_categories_page_settings_color_icon" />
                                        },
                                        {
                                            title: "Желтый",
                                            onclick: () => setFields({...fields, color: 2}),
                                            className: "admin_panel_content_categories_page_settings_color_category_2",
                                            icon: <RectRoundedIcon className="admin_panel_content_categories_page_settings_color_icon admin_panel_content_categories_page_settings_color_icon_red" />
                                        },
                                        {
                                            title: "Синий",
                                            onclick: () => setFields({...fields, color: 3}),
                                            className: "admin_panel_content_categories_page_settings_color_category_3",
                                            icon: <RectRoundedIcon className="admin_panel_content_categories_page_settings_color_icon admin_panel_content_categories_page_settings_color_icon_red" />
                                        },
                                        {
                                            title: "Фиолетовый",
                                            onclick: () => setFields({...fields, color: 4}),
                                            className: "admin_panel_content_categories_page_settings_color_category_4",
                                            icon: <RectRoundedIcon className="admin_panel_content_categories_page_settings_color_icon admin_panel_content_categories_page_settings_color_icon_red" />
                                        },
                                        
                                    ]} 
                                    >
                                    <div className={`admin_panel_content_categories_page_settings_color category_color_${fields.color}`}>
                                        <p>Цвет</p>
                                        <div className={`admin_panel_content_categories_page_settings_color_content app-transition`}>
                                            <RectRoundedIcon className={`admin_panel_content_categories_page_settings_color_content_icon`} />
                                            <p>{fields?.color === 1 ? "Зеленый" : fields?.color === 2 ? "Желтый" : fields?.color === 3 ? "Синий" : "Фиолетовый"}</p>
                                        </div>
                                    </div>
                                </Popup>
                            </div>
                            <div className={`admin_panel_content_categories_page_settings_icon`}>
                                <p>Иконка</p>
                                <div className={`admin_panel_content_categories_page_settings_icon_content app-transition`}>

                                    {
                                    icons.map((categoryItem, index) => (
                                        <div
                                            key={`${categoryItem.id}-${index}`}
                                            className={`admin_panel_content_categories_page_settings_icon_content_item ${
                                                categoryItem.id === fields.icon
                                                    ? "admin_panel_content_categories_page_settings_icon_content_item_active"
                                                    : ""
                                            }`}
                                            onClick={() => setFields({ ...fields, icon: categoryItem.id })}
                                        >
                                            <Category category={{ icon: categoryItem.id }} onClick={() => {}} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <PrimaryButton onClick={() => { doSave() }}>Сохранить</PrimaryButton>
                        </div>
                }
            </div>
    )
}
    
    
const AdminPanel = () => {
    const [activePage, setActivePage] = useState(0);
    
    return (
        <div className="admin_panel">
            <div className="admin_panel_navigation section app-transition">
                <h1>Админ панель</h1>
                <div className="admin_panel_navigation_list">
                    <button className={`admin_panel_navigation_list_item app-transition ${activePage === 0 ? 'admin_panel_navigation_list_item_active' : ''}`} onClick={() => setActivePage(0)}>
                        <AdminPanelIcon />
                        <p>
                            Категории
                        </p>
                    </button>
                    <button className={`admin_panel_navigation_list_item app-transition ${activePage === 1 ? 'admin_panel_navigation_list_item_active' : ''}`} onClick={() => setActivePage(1)}>
                        <AdminPanelIcon />
                        <p>
                            Создать категорию
                        </p>
                    </button>
                    <button className={`admin_panel_navigation_list_item app-transition ${activePage === 2 ? 'admin_panel_navigation_list_item_active' : ''}`} onClick={() => setActivePage(2)}>
                        <AdminPanelIcon />
                        <p>
                            Логи
                        </p>
                    </button>
                    <button className={`admin_panel_navigation_list_item app-transition ${activePage === 3 ? 'admin_panel_navigation_list_item_active' : ''}`} onClick={() => setActivePage(3)}>
                        <AdminPanelIcon />
                        <p>
                            Администраторы
                        </p>
                    </button>
                    <button className={`admin_panel_navigation_list_item app-transition ${activePage === 4 ? 'admin_panel_navigation_list_item_active' : ''}`} onClick={() => setActivePage(4)}>
                        <AdminPanelIcon />
                        <p>
                            Жалобы
                        </p>
                    </button>
                </div>
            </div>
            <div className="admin_panel_content section app-transition">
                {activePage === 0 ? <CategoriesPage /> : <p>Не доступно</p>}
            </div>
        </div>
    )
}

export default AdminPanel