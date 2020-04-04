let video, src, dst, cap, fps;
let threshold1 = parseFloat(document.getElementById('threshold1').value),
    threshold2 = parseFloat(document.getElementById('threshold2').value),
    apertureSize = parseFloat(document.getElementById('apertureSize').value),
    dilate = parseFloat(document.getElementById('dilate').value),
    anchora = parseFloat(document.getElementById('anchor').value),
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

function onOpenCvReady() {
    cv['onRuntimeInitialized'] = () => {
        test();
    };
}

function test() {
    let dst = new cv.Mat();

    let src1 = cv.imread("empty");
    let src2 = cv.imread("test");
    let dsize = new cv.Size(20, 20);
    cv.cvtColor(src1, src1, cv.COLOR_RGBA2GRAY, 0);
    cv.cvtColor(src2, src2, cv.COLOR_RGBA2GRAY, 0);
    cv.imshow('grayscale', src2);
    let ksize = new cv.Size(ksizea, ksizea);
    let anchor = new cv.Point(anchora, anchora);
// You can try more different parameters
    cv.blur(src1, src1, ksize, anchor, cv.BORDER_DEFAULT);
    cv.blur(src2, src2, ksize, anchor, cv.BORDER_DEFAULT);

    cv.imshow('blur', src2);

    cv.subtract(src1, src2, dst);

    cv.imshow('subtract', dst);

    let M = cv.Mat.ones(dilate, dilate, cv.CV_8U);

// You can try more different parameters
    cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    cv.imshow('dilatei', dst);

    cv.Canny(dst, dst, threshold1, threshold2, apertureSize, false);

    cv.imshow('canny', dst);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let poly = new cv.MatVector();
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        // You can try more different parameters
        cv.approxPolyDP(cnt, tmp, 3, true);
        poly.push_back(tmp);
        cnt.delete();
        tmp.delete();
    }

    let max = 0;
    let index = 0;
    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        if (max < cv.contourArea(cnt)) {
            index = i;
            max = cv.contourArea(cnt);
        }
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
            Math.round(Math.random() * 255));
        cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
    }
    cv.imshow('contours', dst);

    // for (let i = 0; i < contours.size(); ++i) {
    let cnt = contours.get(index);
// You can try more different parameters
    let rotatedRect = cv.minAreaRect(cnt);
    let vertices = cv.RotatedRect.points(rotatedRect);
    let contoursColor = new cv.Scalar(255, 255, 255);
    let rectangleColor = new cv.Scalar(255, 0, 0);

    for (let i = 0; i < 4; i++) {
        cv.line(src2, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
    }
    // }
    cv.imshow('rect', src2);
    src1.delete();
    src2.delete();
    dst.delete();
}
