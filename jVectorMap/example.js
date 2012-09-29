// 定义的默认区域颜色
var colors = {
    'CN-11': '#00FFF4',
    'CN-21': '#065FFF', 
    'CN-52': '#ff0000'
};

$('#region-plot').vectorMap({
    map: 'cn_en',
    values: rateData,
    regionColors: colors,
    // replace scaleColors with regionColors -- by tofishes
    // scaleColors: ['#0760FA', '#2CADFF', '#31C8FF', '#00FFFB', '#ff0000', '#FF8B29', '#FCC00A'],
    normalizeFunction: 'polynomial',
    hoverOpacity: 0.5,
    hoverColor: false,
    backgroundColor: 'transparent',
    color: '#CBCBCB',
    onLabelShow: function(e, el, code) {
    }
});

