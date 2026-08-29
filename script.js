const display = document.getElementById('display');
let lastAnswer = 0;
let memory = 0;

window.onload = () => {
    display.focus();
    display.selectionStart = display.value.length;
    display.selectionEnd = display.value.length;
    initConverter(); 
};

// ==========================================
//   SIDEBAR DRAG-TO-RESIZE ENGINE
// ==========================================
const resizer = document.getElementById('resizer');
const sidebar = document.getElementById('tools');
let isResizing = false;
let startX, startWidth;

resizer.addEventListener('mousedown', function(e) {
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth; 
    
    document.body.style.cursor = 'ew-resize';
    resizer.classList.add('active-resizer');
    
    sidebar.style.transition = 'none'; 
    e.preventDefault(); 
});

document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;
    let deltaX = startX - e.clientX; 
    let newWidth = startWidth + (deltaX * 2);
    
    if (newWidth < 280) newWidth = 280; 
    if (newWidth > 600) newWidth = 600; 
    
    document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
});

document.addEventListener('mouseup', function() {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        resizer.classList.remove('active-resizer');
        sidebar.style.transition = ''; 
    }
});

// ---- Mobile Mode Toggle ----
function toggleMobileMode() {
    const isMobileMode = document.getElementById('mobile-mode-switch').checked;
    if (isMobileMode) { display.setAttribute('inputmode', 'none'); } 
    else { display.removeAttribute('inputmode'); }
    display.focus();
}

function showTools() {
    sidebar.classList.toggle('active');
}

// ---- UI Engine ----
function insert(val) {
    display.focus(); 
    if (display.value === 'Error') display.value = '0';

    let start = display.selectionStart;
    let end = display.selectionEnd;
    
    if (display.value === '0' && end <= 1) {
        if (!['×', '÷', '+', '−', '^', 'P', 'C', '!', '⁻¹', '²', '³'].includes(val)) {
            display.value = val;
            display.selectionStart = display.value.length;
            display.selectionEnd = display.value.length;
            display.dispatchEvent(new Event('input')); 
            return;
        }
    }

    display.setRangeText(val, start, end, "end");
    display.dispatchEvent(new Event('input')); 
}

function clearDisplay() { 
    display.value = '0'; 
    display.focus();
    display.selectionStart = 1;
    display.selectionEnd = 1;
}

function deleteChar() {
    display.focus();
    if (display.value === 'Error') {
        display.value = '0';
        display.selectionStart = 1;
        display.selectionEnd = 1;
        return;
    }

    let start = display.selectionStart;
    let end = display.selectionEnd;

    if (start === end && start > 0) { display.setRangeText("", start - 1, end, "end"); } 
    else if (start !== end) { display.setRangeText("", start, end, "end"); }

    if (display.value === "") {
        display.value = "0";
        display.selectionStart = 1;
        display.selectionEnd = 1;
    }
}

function insertAns() { insert('Ans'); }

// ---- Memory Functions ----
function memoryPlus() {
    try { calculate(); memory += parseFloat(display.value) || 0; display.value = "0"; display.focus(); display.selectionStart = 1; display.selectionEnd = 1; } catch(e) {}
}
function memoryMinus() {
    try { calculate(); memory -= parseFloat(display.value) || 0; display.value = "0"; display.focus(); display.selectionStart = 1; display.selectionEnd = 1; } catch(e) {}
}
function memoryRecall() { insert(memory.toString()); }

// ---- Math Engine Helpers ----
function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }
function nCr(n, r) { return r > n ? 0 : fact(n) / (fact(r) * fact(n - r)); }
function nPr(n, r) { return r > n ? 0 : fact(n) / fact(n - r); }
function toDeg(rad) { return rad * (180 / Math.PI); }
function toRad(deg) { return deg * (Math.PI / 180); }
function polar(x, y) { return Math.hypot(x, y); } 
function rect(r, theta) { return r * Math.cos(theta); } 
function engFormat(num) { return Number(num).toExponential(3); } 
function frac(a, b) { return a / b; } 
function dmsToDec(d, m=0, s=0) { return d + (m/60) + (s/3600); }
function nthRoot(n, x) { return Math.pow(x, 1/n); }

// ---- Main Parser & Evaluator ----
function calculate() {
    let exp = display.value;
    if (!exp || exp === 'Error') return;

    const reverseSuperMap = {
        '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', 
        '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9', '⁻':'−', '⁺':'+', 'ˣ':'×', '·':'.'
    };

    exp = exp.replace(/⁽([^⁾]*)⁾?/g, (match, inner) => {
        let standard = inner.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ·]/g, char => reverseSuperMap[char] || char);
        return '**(' + standard + ')';
    });

    exp = exp.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, match => {
        let standard = match.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, char => reverseSuperMap[char] || char);
        return '**(' + standard + ')';
    });

    exp = exp.replace(/×10\^/g, '*10**').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E').replace(/Ans/g, lastAnswer).replace(/²/g, '**2').replace(/³/g, '**3').replace(/⁻¹/g, '**-1').replace(/\^/g, '**');
    exp = exp.replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(').replace(/asin\(/g, 'Math.asin(').replace(/acos\(/g, 'Math.acos(').replace(/atan\(/g, 'Math.atan(').replace(/sinh\(/g, 'Math.sinh(').replace(/cosh\(/g, 'Math.cosh(').replace(/tanh\(/g, 'Math.tanh(').replace(/log\(/g, 'Math.log10(').replace(/ln\(/g, 'Math.log(').replace(/x√\(/g, 'nthRoot(').replace(/∛\(/g, 'Math.cbrt(').replace(/√\(/g, 'Math.sqrt(').replace(/Pol\(/g, 'polar(').replace(/Rec\(/g, 'rect(').replace(/ENG\(/g, 'engFormat(').replace(/ab\/c\(/g, 'frac(').replace(/d\/c\(/g, 'frac(').replace(/dms\(/g, 'dmsToDec(');
    exp = exp.replace(/deg\(/g, 'toDeg(').replace(/rad\(/g, 'toRad(').replace(/%/g, '/100');
    exp = exp.replace(/(\d+)C(\d+)/g, 'nCr($1,$2)').replace(/(\d+)P(\d+)/g, 'nPr($1,$2)').replace(/(\d+)!/g, 'fact($1)');

    try {
        const compute = new Function('nCr', 'nPr', 'fact', 'toDeg', 'toRad', 'polar', 'rect', 'engFormat', 'frac', 'dmsToDec', 'nthRoot', 'return ' + exp);
        let result = compute(nCr, nPr, fact, toDeg, toRad, polar, rect, engFormat, frac, dmsToDec, nthRoot);
        if (!Number.isInteger(result) && typeof result === 'number') result = parseFloat(result.toPrecision(12));
        display.value = result.toString();
        lastAnswer = result; 
        display.focus();
        display.selectionStart = display.value.length;
        display.selectionEnd = display.value.length;
    } catch (error) {
        display.value = 'Error'; display.focus(); setTimeout(clearDisplay, 1500);
    }
}

// ---- STRICT KEYBOARD FILTER ----
display.addEventListener('keydown', function(event) {
    if (event.key.length > 1 || event.ctrlKey || event.metaKey || event.key === ',') return;
    const allowedCharacters = /^[0-9\+\-\*\/\.\(\)\^!%=]$/;
    if (!allowedCharacters.test(event.key)) event.preventDefault(); 
});

// ---- NATIVE KEYBOARD TYPING HANDLER (MAGIC FORMATTING) ----
display.addEventListener('input', function() {
    let cursor = display.selectionStart;
    let originalValue = display.value;
    let newValue = originalValue.replace(/^0+(?=\d)/, '');
    newValue = newValue.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');

    const superMap = { '0':'⁰', '1':'¹', '2':'²', '3':'³', '4':'⁴', '5':'⁵', '6':'⁶', '7':'⁷', '8':'⁸', '9':'⁹', '−':'⁻', '-': '⁻', '+': '⁺', '(': '⁽', ')': '⁾', '×': 'ˣ', '÷': '÷', '.': '·' };
    
    newValue = newValue.replace(/\^\(/g, '⁽');
    newValue = newValue.replace(/\^([0-9−])/g, (m, p1) => superMap[p1]);
    
    while (/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻])([0-9−])/.test(newValue)) newValue = newValue.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻])([0-9−])/g, (m, p1, p2) => p1 + superMap[p2]);
    while (/(⁽[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ·÷]*)([0-9−\+\×\÷\(\)\.])/.test(newValue)) newValue = newValue.replace(/(⁽[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ·÷]*)([0-9−\+\×\÷\(\)\.])/g, (m, p1, p2) => p1 + (superMap[p2] || p2));

    if (originalValue !== newValue) {
        display.value = newValue;
        display.selectionStart = display.selectionEnd = cursor + (newValue.length - originalValue.length);
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === '=') { calculate(); event.preventDefault(); } 
    else if (event.key === 'Escape') { clearDisplay(); event.preventDefault(); }
});

// ==========================================
//   ULTIMATE UNIVERSAL CONVERTER ENGINE 
// ==========================================

const convertData = {
    angle: {
        'Degree': 1,
        'Radian': 180 / Math.PI,
        'Gradian': 0.9,
        'Arcsecond': 1 / 3600,
        'Minute of arc': 1 / 60,
        'Milliradian': (180 / Math.PI) / 1000
    },
    area: {
        'Square metre': 1,
        'Square kilometre': 1000000,
        'Square mile': 2589988.11,
        'Square yard': 0.836127,
        'Square foot': 0.092903,
        'Square inch': 0.00064516,
        'Hectare': 10000,
        'Acre': 4046.86
    },
    data: {
        'Bit per second': 1,
        'Kilobit per second': 1000,
        'Kilobyte per second': 8000,
        'Kibibit per second': 1024,
        'Megabit per second': 1e6,
        'Megabyte per second': 8e6,
        'Mebibit per second': 1048576,
        'Gigabit per second': 1e9,
        'Gigabyte per second': 8e9,
        'Gibibit per second': 1073741824,
        'Terabit per second': 1e12,
        'Terabyte per second': 8e12,
        'Tebibit per second': 1099511627776
    },
    storage: {
        'Byte': 1,
        'Kilobyte': 1000,
        'Kibibyte': 1024,
        'Megabyte': 1e6,
        'Mebibyte': 1048576,
        'Gigabyte': 1e9,
        'Gibibyte': 1073741824,
        'Terabyte': 1e12,
        'Tebibyte': 1099511627776,
        'Petabyte': 1e15,
        'Pebibyte': 1125899906842624,
        'Kibibit': 128,
        'Megabit': 125000,
        'Mebibit': 131072,
        'Gigabit': 125000000,
        'Gibibit': 134217728,
        'Terabit': 125000000000,
        'Tebibit': 137438953472,
        'Petabit': 125000000000000,
        'Pebibit': 140737488355328
    },
    energy: {
        'Joule': 1,
        'Kilojoule': 1000,
        'Gram calorie': 4.184,
        'Kilocalorie': 4184,
        'Watt hour': 3600,
        'Kilowatt-hour': 3600000,
        'Electronvolt': 1.602176634e-19,
        'British thermal unit': 1055.06,
        'US therm': 105480400,
        'Foot-pound': 1.355818
    },
    frequency: {
        'Hertz': 1,
        'Kilohertz': 1000,
        'Megahertz': 1e6,
        'Gigahertz': 1e9
    },
    fuel: {
        'Kilometer per liter': 1,
        'Mile per US gallon': 0.4251437,
        'Mile per gallon': 0.354006,
        'Litre per 100 kilometres': -1 
    },
    length: {
        'Metre': 1,
        'Kilometre': 1000,
        'Centimetre': 0.01,
        'Millimetre': 0.001,
        'Micrometre': 1e-6,
        'Nanometre': 1e-9,
        'Mile': 1609.344,
        'Yard': 0.9144,
        'Foot': 0.3048,
        'Inch': 0.0254,
        'Nautical mile': 1852
    },
    mass: {
        'Gram': 1,
        'Kilogram': 1000,
        'Tonne': 1000000,
        'Milligram': 0.001,
        'Microgram': 1e-6,
        'Imperial ton': 1016046.91,
        'US ton': 907184.74,
        'Stone': 6350.29318,
        'Pound': 453.59237,
        'Ounce': 28.34952
    },
    pressure: {
        'Pascal': 1,
        'Bar': 100000,
        'Pound per square inch': 6894.757,
        'Standard atmosphere': 101325,
        'Torr': 133.3224
    }, 
    speed: {
        'Metre per second': 1,
        'Foot per second': 0.3048,
        'Kilometre per hour': 0.2777777778,
        'Mile per hour': 0.44704,
        'Knot': 0.5144444444
    },
    time: {
        'Nanosecond': 1e-9,
        'Microsecond': 1e-6,
        'Millisecond': 0.001,
        'Second': 1,
        'Minute': 60,
        'Hour': 3600,
        'Day': 86400,
        'Week': 604800,
        'Month': 2628000,
        'Calendar year': 31536000,
        'Decade': 315360000,
        'Century': 3153600000
    },
    volume: {
        'Cubic meter': 1,
        'Litre': 0.001,
        'Milliliter': 1e-6,
        'US liquid gallon': 0.00378541,
        'US liquid quart': 0.000946353,
        'US liquid pint': 0.000473176,
        'US legal cup': 0.00024,
        'US fluid ounce': 2.95735e-5,
        'US tablespoon': 1.47868e-5,
        'US teaspoon': 4.92892e-6,
        'Imperial gallon': 0.00454609,
        'Imperial quart': 0.00113652,
        'Imperial pint': 0.000568261,
        'Imperial cup': 0.000284131,
        'Imperial fluid ounce': 2.84131e-5,
        'Imperial tablespoon': 1.77582e-5,
        'Imperial teaspoon': 5.91939e-6,
        'Cubic foot': 0.0283168,
        'Cubic inch': 1.63871e-5
    },
    temperature: {
        'Degree Celsius': 'C',
        'Fahrenheit': 'F',
        'Kelvin': 'K'
    }
};

function initConverter() {
    const category = document.getElementById('conv-category').value;
    const select1 = document.getElementById('conv-unit1');
    const select2 = document.getElementById('conv-unit2');
    
    select1.innerHTML = select2.innerHTML = '';
    const units = Object.keys(convertData[category]);
    
    units.sort().forEach(unit => {
        select1.options.add(new Option(unit, unit));
        select2.options.add(new Option(unit, unit));
    });

    if (units.length > 1) select2.selectedIndex = 1;
    document.getElementById('conv-input1').value = '1';
    convertValue(1);
}

function swapConverter() {
    const i1 = document.getElementById('conv-input1'), i2 = document.getElementById('conv-input2');
    const s1 = document.getElementById('conv-unit1'), s2 = document.getElementById('conv-unit2');
    
    let tempIdx = s1.selectedIndex; s1.selectedIndex = s2.selectedIndex; s2.selectedIndex = tempIdx;
    let tempVal = i1.value; i1.value = i2.value; i2.value = tempVal;
    
    convertValue(1);
}

function convertValue(source) {
    const category = document.getElementById('conv-category').value;
    let fromInput = document.getElementById(source === 1 ? 'conv-input1' : 'conv-input2');
    let targetInput = document.getElementById(source === 1 ? 'conv-input2' : 'conv-input1');
    let fromUnit = document.getElementById(source === 1 ? 'conv-unit1' : 'conv-unit2').value;
    let targetUnit = document.getElementById(source === 1 ? 'conv-unit2' : 'conv-unit1').value;

    if (fromInput.value === '') { targetInput.value = ''; return; }
    let val = parseFloat(fromInput.value), result = 0;

    if (category === 'temperature') {
        let cVal = fromUnit === 'Degree Celsius' ? val : fromUnit === 'Fahrenheit' ? (val - 32) * 5/9 : val - 273.15;
        result = targetUnit === 'Degree Celsius' ? cVal : targetUnit === 'Fahrenheit' ? (cVal * 9/5) + 32 : cVal + 273.15;
    } 
    else if (category === 'fuel') {
        let baseVal = (fromUnit === 'Litre per 100 kilometres') ? (100 / val) : (val * convertData[category][fromUnit]);
        result = (targetUnit === 'Litre per 100 kilometres') ? (100 / baseVal) : (baseVal / convertData[category][targetUnit]);
    } 
    else {
        result = (val * convertData[category][fromUnit]) / convertData[category][targetUnit];
    }
    
    if (!isFinite(result)) {
        targetInput.value = (result === Infinity) ? '∞' : '';
    } else {
        targetInput.value = parseFloat(result.toPrecision(7));
    }
}
