const viewData = {
    id: "codbex-jason-projects",
    label: "Projects",
    lazyLoad: true,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Project/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}