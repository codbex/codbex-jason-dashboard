const viewData = {
    id: "codbex-jason-milestones",
    label: "Milestones",
    lazyLoad: true,
    link: "/services/web/codbex-projects/gen/codbex-projects/ui/Milestone/index.html?embedded"
};
if (typeof exports !== 'undefined') {
    exports.getView = function () {
        return viewData;
    }
}