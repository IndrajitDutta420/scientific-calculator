const display = document.getElementById('display');
let lastAnswer = 0;
let memory = 0;

window.onload = () => {
    display.focus();
    display.selectionStart = display.value.length;
    display.selectionEnd = display.value.length;
};

// ---- Mobile Mode Toggle ----
function toggleMobileMode() {
    const isMobileMode = document.getElementById('mobile-mode-switch').checked;
    
    if (isMobileMode) {
        display.setAttribute('inputmode', 'none'); 
    } else {
        display.removeAttribute('inputmode');
    }
    
    display.focus();
}

function showTools() {
    document.getElementById('tools').classList.toggle('active');
}

// ---- UI Engine ----
function insert(val) {
    display.focus(); 
    
    if (display.value === 'Error') {
        display.value = '0';
    }

    let start = display.selectionStart;
    let end = display.selectionEnd;
    
    if (display.value === '0' && end <= 1) {
        if (!['×', '÷', '+', '−', '^', 'P', 'C', '!', '⁻¹', '²', '³'].includes(val)) {
            display.value = val;
            display.selectionStart = display.value.length;
            display.selectionEnd = display.value.length;
            
            // Force the input formatter to run so buttons become superscripts instantly
            display.dispatchEvent(new Event('input')); 
            return;
        }
    }

    display.setRangeText(val, start, end, "end");
    
    // Force the input formatter to run so buttons become superscripts instantly
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

    if (start === end && start > 0) {
        display.setRangeText("", start - 1, end, "end");
    } else if (start !== end) {
        display.setRangeText("", start, end, "end");
    }

    if (display.value === "") {
        display.value = "0";
        display.selectionStart = 1;
        display.selectionEnd = 1;
    }
}

function insertAns() { insert('Ans'); }

// ---- Memory Functions ----
function memoryPlus() {
    try {
        calculate(); 
        memory += parseFloat(display.value) || 0;
        display.value = "0";
        display.focus();
        display.selectionStart = 1;
        display.selectionEnd = 1;
    } catch(e) {}
}

function memoryMinus() {
    try {
        calculate();
        memory -= parseFloat(display.value) || 0;
        display.value = "0";
        display.focus();
        display.selectionStart = 1;
        display.selectionEnd = 1;
    } catch(e) {}
}

function memoryRecall() {
    insert(memory.toString());
}

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

    // NEW: Safely converts any beautiful superscripts back to standard math (e.g. ¹⁴ becomes **(14))
    exp = exp.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, match => {
        let standard = match.replace(/⁰/g, '0').replace(/¹/g, '1').replace(/²/g, '2')
                            .replace(/³/g, '3').replace(/⁴/g, '4').replace(/⁵/g, '5')
                            .replace(/⁶/g, '6').replace(/⁷/g, '7').replace(/⁸/g, '8')
                            .replace(/⁹/g, '9').replace(/⁻/g, '-');
        return '**(' + standard + ')';
    });

    exp = exp.replace(/×/g, '*')
             .replace(/÷/g, '/')
             .replace(/−/g, '-')
             .replace(/π/g, 'Math.PI')
             .replace(/e/g, 'Math.E')
             .replace(/Ans/g, lastAnswer)
             .replace(/\^/g, '**');

    exp = exp.replace(/sin\(/g, 'Math.sin(')
             .replace(/cos\(/g, 'Math.cos(')
             .replace(/tan\(/g, 'Math.tan(')
             .replace(/asin\(/g, 'Math.asin(')
             .replace(/acos\(/g, 'Math.acos(')
             .replace(/atan\(/g, 'Math.atan(')
             .replace(/sinh\(/g, 'Math.sinh(')
             .replace(/cosh\(/g, 'Math.cosh(')
             .replace(/tanh\(/g, 'Math.tanh(')
             .replace(/log\(/g, 'Math.log10(') 
             .replace(/ln\(/g, 'Math.log(')    
             .replace(/x√\(/g, 'nthRoot(')
             .replace(/∛\(/g, 'Math.cbrt(')
             .replace(/√\(/g, 'Math.sqrt(')
             .replace(/Pol\(/g, 'polar(')
             .replace(/Rec\(/g, 'rect(')
             .replace(/ENG\(/g, 'engFormat(')
             .replace(/ab\/c\(/g, 'frac(')
             .replace(/d\/c\(/g, 'frac(')
             .replace(/dms\(/g, 'dmsToDec(');

    exp = exp.replace(/deg\(/g, 'toDeg(')
             .replace(/rad\(/g, 'toRad(')
             .replace(/%/g, '/100');

    exp = exp.replace(/(\d+)C(\d+)/g, 'nCr($1,$2)');
    exp = exp.replace(/(\d+)P(\d+)/g, 'nPr($1,$2)');
    exp = exp.replace(/(\d+)!/g, 'fact($1)');

    try {
        const compute = new Function(
            'nCr', 'nPr', 'fact', 'toDeg', 'toRad', 'polar', 'rect', 'engFormat', 'frac', 'dmsToDec', 'nthRoot',
            'return ' + exp
        );
        
        let result = compute(nCr, nPr, fact, toDeg, toRad, polar, rect, engFormat, frac, dmsToDec, nthRoot);

        if (!Number.isInteger(result) && typeof result === 'number') {
            result = parseFloat(result.toPrecision(12));
        }

        display.value = result.toString();
        lastAnswer = result; 
        
        display.focus();
        display.selectionStart = display.value.length;
        display.selectionEnd = display.value.length;
        
    } catch (error) {
        display.value = 'Error';
        display.focus();
        setTimeout(clearDisplay, 1500);
    }
}

// ---- STRICT KEYBOARD FILTER (BLOCKS LETTERS) ----
display.addEventListener('keydown', function(event) {
    if (event.key.length > 1 || event.ctrlKey || event.metaKey) {
        return; 
    }

    if (event.key === ',') {
        return;
    }

    const allowedCharacters = /^[0-9\+\-\*\/\.\(\)\^!%=]$/;

    if (!allowedCharacters.test(event.key)) {
        event.preventDefault(); 
    }
});

// ---- NATIVE KEYBOARD TYPING HANDLER (MAGIC FORMATTING) ----
display.addEventListener('input', function() {
    let cursor = display.selectionStart;
    let originalValue = display.value;

    let newValue = originalValue.replace(/^0+(?=\d)/, '');

    newValue = newValue.replace(/\*/g, '×')
                       .replace(/\//g, '÷')
                       .replace(/-/g, '−');

    // MAGIC SUPERSCRIPT ENGINE: Automatically converts typed numbers into exponents
    const superMap = {'0':'⁰', '1':'¹', '2':'²', '3':'³', '4':'⁴', '5':'⁵', '6':'⁶', '7':'⁷', '8':'⁸', '9':'⁹', '−':'⁻'};
    
    // 1. Instantly floats any number typed directly after a ^ symbol
    newValue = newValue.replace(/\^([0-9−])/g, (m, p1) => superMap[p1]);
    
    // 2. Keeps chaining superscripts together (so 14 becomes ¹⁴)
    while (/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻])([0-9−])/.test(newValue)) {
        newValue = newValue.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻])([0-9−])/g, (m, p1, p2) => p1 + superMap[p2]);
    }

    if (originalValue !== newValue) {
        display.value = newValue;
        let offset = newValue.length - originalValue.length;
        display.selectionStart = cursor + offset;
        display.selectionEnd = cursor + offset;
    }
});

// ---- KEYBOARD ACTION HANDLER (ENTER / ESCAPE) ----
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === '=') {
        calculate();
        event.preventDefault(); 
    } 
    else if (event.key === 'Escape') {
        clearDisplay();
        event.preventDefault();
    }
});
