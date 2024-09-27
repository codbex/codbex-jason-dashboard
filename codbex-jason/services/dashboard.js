const viewData = {
    id: "codbex-jason-dashboard",
    label: "Dashboard",
    lazyLoad: true,
    link: "/services/web/codbex-jason/subviews/dashboard.html"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}