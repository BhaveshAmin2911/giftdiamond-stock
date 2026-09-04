import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import ProductList from "./products/ProductList/ProductList";
import CreateProduct from "./products/CreateProduct/CreateProduct";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadMasterData } from "./store/services/masterDataService";
import EditProduct from "./products/EditProduct/EditProduct";
import ViewProduct from "./products/ViewProduct/ViewProduct";
import KarigarPrint from "./print/karigarPrint/karigarPrint";
import ExportProduct from "./products/ExportProduct/ExportProduct";
import OrderPrint from "./print/OrderPrint/OrderPrint";
import BarcodeListener from "./products/BarcodeDetect/BarcodeDetect";
import AllProducts from "./products/AllProduct/AllProduct";
import BillPrint from "./print/BillPrint/BillPrint";
import GenerateOrder from "./GenerateOrder/GenerateOrder";
import AddCustomer from "./pages/AddCustomer/AddCustomer";
import CastingList from "./products/CastingList/CastingList";
import EditCasting from "./products/EditCasting/EditCasting";
import CastingScan from "./products/BarcodeDetect/castingSacn/CastingScan";
import Dashboard from "./pages/Dashboard/Dashboard";
import NotAuthpage from "./pages/NotAuthpage/NotAuthpage";
import Catalog from "./products/Catalog/Catalog";
import Catalogprint from "./print/CatalogPrint/CatalogPrint";
import OrderList from "./Order/OrderList/OrderList";
import OrderData from "./Order/OrderData/OrderData";
import BoxPrint from "./print/Boxprint/BoxPrint";
import BoxProduct from "./products/BoxProducts/BoxProducts";
import "./assests/scss/variable.scss";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.auth.data);

  const [user_data, setuser_data] = useState();

  useEffect(() => {
    setuser_data(userData?.user);
  }, [userData])

  useEffect(() => {
    const token = localStorage.getItem("daj-token");
    if (token) {
      loadMasterData(dispatch);
    } else if (window.location.pathname != '/login') {
      window.location.pathname = '/login';
    }
  }, [])

  let compo_array = [
    { 'path': "/dashboard", 'element': <Dashboard />, 'access': ['admin', 'manager', 'staff', 'karigar', 'customer'] },
    { 'path': "/not-auth", 'element': <NotAuthpage />, 'access': ['admin', 'manager', 'staff', 'karigar'] },
    { 'path': "/login", 'element': <Login />, 'access': ['admin', 'manager', 'staff', 'karigar'] },
    { 'path': "/register", 'element': <Register />, 'access': ['admin'] },
    { 'path': "/products/process", 'element': <ProductList />, 'access': ['admin', 'manager', 'staff', 'karigar'] },
    { 'path': "/products/casting", 'element': <CastingList />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/all/products", 'element': <AllProducts />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/export-product", 'element': <ExportProduct />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/products/create", 'element': <CreateProduct />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/products/edit/:id", 'element': <EditProduct />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/edit/casting/:sku", 'element': <EditCasting />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/products/view/:id", 'element': <ViewProduct />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/print/karigar", 'element': <KarigarPrint />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/print/order", 'element': <OrderPrint />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/print/bill", 'element': <BillPrint />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/print/box/:id", 'element': <BoxPrint />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/generate/order", 'element': <GenerateOrder />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/add/customer", 'element': <AddCustomer />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/product/scan", 'element': <BarcodeListener />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/casting/scan", 'element': <CastingScan />, 'access': ['admin', 'manager', 'staff'] },
    { 'path': "/product/catalog", 'element': <Catalog />, 'access': ['admin', 'manager', 'staff', 'customer'] },
    { 'path': "/print/catalog/:id", 'element': <Catalogprint />, 'access': ['admin', 'manager', 'staff', 'customer'] },
    { 'path': "/order", 'element': <OrderList />, 'access': ['admin', 'manager'] },
    { 'path': "/order/products", 'element': <OrderData />, 'access': ['admin', 'manager'] },
    { 'path': "/box-list", 'element': <BoxProduct />, 'access': ['admin', 'manager'] },
  ]

  if (user_data) {

    return (
      <Routes>
        <Route path="/"
          element={
            localStorage.getItem("daj-token") ? (<Navigate to="/dashboard" />) : (<Login />)
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>}
        >
          {compo_array.map((route) => {
            return (
              <Route path={route.path} element={route.access.includes(user_data?.role) ? route.element : <NotAuthpage />} />
            );
          })}
        </Route>
      </Routes>
    );
  } else {
    return (
      <>
        <Routes>
          <Route path="/login"
            element={
              <Login />
            }
          />
        </Routes>
        <div className="daj-mian-loading-con">
          <img src='https://app.dajdiamond.com/uploads/daj-main-loader.gif' />
          <span>Loadding ...</span>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </>
    );
  }
}

export default App;