const viewData = {
    id: "codbex-jason-employees",
    label: "Employees",
    lazyLoad: true,
    link: "/services/web/codbex-employees/gen/codbex-employees/ui/Employees/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}