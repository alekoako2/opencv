let video, src, dst, cap, fps;
let threshold1 = parseFloat(document.getElementById('threshold1').value),
    threshold2 = parseFloat(document.getElementById('threshold2').value),
    apertureSize = parseFloat(document.getElementById('apertureSize').value),
    dilate = parseFloat(document.getElementById('dilate').value),
    anchora = parseFloat(document.getElementById('anchor').value),
    closedKsize = parseFloat(document.getElementById('closedKsize').value),
    ksizea = parseFloat(document.getElementById('ksize').value);

console.log(dilate);
document.getElementById('threshold1').addEventListener('input', (e) => {
    threshold1 = parseFloat(e.target.value);
    test();

});
document.getElementById('threshold2').addEventListener('input', (e) => {
    threshold2 = parseFloat(e.target.value);
    test();
});
document.getElementById('apertureSize').addEventListener('input', (e) => {
    apertureSize = parseFloat(e.target.value);
    test();

});
document.getElementById('dilate').addEventListener('input', (e) => {
    dilate = parseFloat(e.target.value);
    test();

});
document.getElementById('anchor').addEventListener('input', (e) => {
    anchora = parseFloat(e.target.value);
    test();

});
document.getElementById('ksize').addEventListener('input', (e) => {
    ksizea = parseFloat(e.target.value);
    test();

});
document.getElementById('closedKsize').addEventListener('input', (e) => {
    closedKsize = parseFloat(e.target.value);
    test();

});

function onOpenCvReady() {
    cv['onRuntimeInitialized'] = () => {
        test();
    };
}

function test() {
    let dst = new cv.Mat();

    let src1 = cv.imread("empty");
    let toShow = cv.imread("test");
    let src2 = cv.imread("test");
    let dsize = new cv.Size(20, 20);
    cv.cvtColor(src1, src1, cv.COLOR_RGBA2GRAY, 0);
    cv.cvtColor(src2, src2, cv.COLOR_RGBA2GRAY, 0);
    cv.imshow('grayscale', src2);
    let ksize = new cv.Size(ksizea, ksizea);
    let anchor = new cv.Point(anchora, anchora);
// You can try more different parameters
    cv.GaussianBlur(src1, src1, ksize, 0, 0, cv.BORDER_DEFAULT);
    cv.GaussianBlur(src2, src2, ksize, 0, 0, cv.BORDER_DEFAULT);

    cv.imshow('blur', src2);

    cv.subtract(src1, src2, dst);

    cv.imshow('subtract', dst);

    let M = cv.Mat.ones(dilate, dilate, cv.CV_8U);

// You can try more different parameters
    cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    cv.imshow('dilatei', dst);

    cv.Canny(dst, dst, threshold1, threshold2, apertureSize, false);

    cv.imshow('canny', dst);

    let closedKsizeaa = new cv.Size(closedKsize, closedKsize);

    let kernel = cv.getStructuringElement(cv.MORPH_RECT, closedKsizeaa);
    cv.morphologyEx(dst, dst, cv.MORPH_GRADIENT, kernel);

    cv.imshow('closed', dst);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let poly = new cv.MatVector();
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    // for (let i = 0; i < contours.size(); ++i) {
    //     let tmp = new cv.Mat();
    //     let cnt = contours.get(i);
    //     // You can try more different parameters
    //     cv.approxPolyDP(cnt, tmp, 3, true);
    //     poly.push_back(tmp);
    //     cnt.delete();
    //     tmp.delete();
    // }
    let hull = new cv.MatVector();

    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        // You can try more different parameters
        cv.convexHull(cnt, tmp, false, true);
        hull.push_back(tmp);
        cnt.delete();
        tmp.delete();
    }
    // perimeter = cv.arcLength(cnt,True)
    let max = 0;
    let index = 0;
    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        if (max < cv.arcLength(cnt, true)) {
            index = i;
            max = cv.arcLength(cnt, true);
        }
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
            Math.round(Math.random() * 255));
        cv.drawContours(dst, hull, i, color, 1, cv.LINE_8, hierarchy, 100);
    }
    cv.imshow('contours', dst);

    // for (let i = 0; i < contours.size(); ++i) {
    let cnt = contours.get(index);

    var lcntPoint = [], lcnt2Point = [];
    for (let i = 0; i < cnt.rows; i++) {

        lcntPoint.push({x: cnt.data32S[i * 2], y: cnt.data32S[i * 2 + 1]});
    }
    var a = findMinPointX(lcntPoint);
    var extLeft = [a.x, a.y];
    a = findMaxPointX(lcntPoint);
    var extRight = [a.x, a.y];

    a = findMinPointY(lcntPoint);
    var extTop = [a.x, a.y];

    a = findMaxPointY(lcntPoint);
    var extBottom = [a.x, a.y];

    function findMinPointX(arr) {
        var x = [];
        for (let i = 0; i < arr.length; i++) {
            x[i] = arr[i].x;
        }
        var MinPos = x.indexOf(Math.min(...x));
        return arr[MinPos];
    }

    function findMaxPointX(arr) {
        var x = [];
        for (let i = 0; i < arr.length; i++) {

            x[i] = arr[i].x;
        }

        var MaxPos = x.indexOf(Math.max(...x));
        return arr[MaxPos];
    }

    function findMinPointY(arr) {
        var x = [];
        for (let i = 0; i < arr.length; i++) {
            x[i] = arr[i].y;
        }
        var MinPos = x.indexOf(Math.min(...x));
        return arr[MinPos];
    }

    function findMaxPointY(arr) {
        var y = [];
        for (let i = 0; i < arr.length; i++) {
            y[i] = arr[i].y;
        }
        var MaxPos = y.indexOf(Math.max(...y));
        return arr[MaxPos];
    }

    console.log(`extreme left: ${extLeft}`);
    console.log(`extreme top: ${extTop}`);
    console.log(`extreme bottom: ${extBottom}`);
    console.log(`extreme right: ${extRight}`);

    let circlel = new cv.Circle(new cv.Point(...extLeft), 3);
    let circler = new cv.Circle(new cv.Point(...extRight), 3);
    let circlet = new cv.Circle(new cv.Point(...extTop), 3);
    let circleb = new cv.Circle(new cv.Point(...extBottom), 3);
    let circleColor = new cv.Scalar(255, 0, 0);

    cv.circle(toShow, circlel.center, circlel.radius, circleColor);
    cv.circle(toShow, circler.center, circler.radius, circleColor);
    cv.circle(toShow, circlet.center, circlet.radius, circleColor);
    cv.circle(toShow, circleb.center, circleb.radius, circleColor);

    cv.imshow('rect', toShow);


// You can try more different parameters
    let rotatedRect = cv.minAreaRect(cnt);
    let vertices = cv.RotatedRect.points(rotatedRect);
    let contoursColor = new cv.Scalar(255, 255, 255);
    let rectangleColor = new cv.Scalar(255, 0, 0);

    for (let i = 0; i < 4; i++) {
        cv.line(toShow, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
    }
    // }
    cv.imshow('rect', toShow);
    toShow.delete();
    src1.delete();
    src2.delete();
    dst.delete();
}
