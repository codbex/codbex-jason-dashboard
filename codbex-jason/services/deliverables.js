const viewData = {
    id: "codbex-jason-deliverables",
    label: "Deliverables",
    lazyLoad: true,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Deliverable/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}