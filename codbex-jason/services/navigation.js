const perspectiveData = {
    id: "codbex-jason-launchpad",
    name: "Jason",
    link: "../codbex-jason/index.html",
    order: "0",
    icon: "../codbex-jason/images/navigation.svg",
};

if (typeof exports !== 'undefined') {
    exports.getPerspective = function () {
        return perspectiveData;
    }
}