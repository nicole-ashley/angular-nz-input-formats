/*!
 * angular-nz-input-formats
 * Angular directives to validate and format NZ-specific input types
 * @version v0.1.3
 * @link https://github.com/nikrolls/angular-nz-input-formats
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(window, angular, undefined){///<reference path="../definitions\angularjs\angular.d.ts"/>
var NZInputFormats;
(function (NZInputFormats) {
    NZInputFormats.module = angular.module('nzInputFormats', []);
})(NZInputFormats || (NZInputFormats = {}));

///<reference path="../definitions\angularjs\angular.d.ts"/>
///<reference path="angular-nz-input-formats.ts"/>
var NZInputFormats;
(function (NZInputFormats) {
    var SimpleInputMask = (function () {
        function SimpleInputMask(mask, maskChars) {
            if (mask === void 0) { mask = null; }
            if (maskChars === void 0) { maskChars = null; }
            // Directive properties
            this.require = 'ngModel';
            this.restrict = 'A';
            this.link = null;
            this.name = undefined;
            this.options = {
                mask: null
            };
            this.mask = null;
            this.maskChars = {
                '*': /./,
                'A': /[A-Za-z]/,
                '9': /[0-9]/
            };
            this.scope = null;
            this.elem = null;
            this.ctrl = null;
            this.document = null;
            this.lastLen = 0;
            this.setMask(mask);
            if (maskChars) {
                this.maskChars = maskChars;
            }
            this.link = angular.bind(this, this.doLink);
        }
        SimpleInputMask.prototype.setMask = function (mask) {
            if (mask !== this.options['mask']) {
                this.mask = mask.split('');
                this.options['mask'] = mask;
                if (this.elem) {
                    this.parser(this.elem.val());
                }
            }
        };
        SimpleInputMask.Factory = function ($document) {
            var inst = new SimpleInputMask();
            inst.document = $document[0];
            return inst;
        };
        SimpleInputMask.prototype.doLink = function (scope, elem, attrs, ctrl) {
            this.scope = scope;
            this.elem = elem;
            this.ctrl = ctrl;
            attrs.$observe(this.name, angular.bind(this, this.processAttributeValue));
            ctrl.$formatters.push(angular.bind(this, this.formatter));
            ctrl.$parsers.push(angular.bind(this, this.parser));
            ctrl.$validators[this.name] = angular.bind(this, this.validator);
        };
        SimpleInputMask.prototype.processAttributeValue = function (value) {
            var options = this.scope.$eval(value);
            if (options) {
                if (options['mask']) {
                    this.setMask(options['mask']);
                }
                this.options = angular.extend(this.options, options);
                this.ctrl.$$parseAndValidate();
            }
        };
        SimpleInputMask.prototype.formatter = function (output) {
            var _this = this;
            if (output === void 0) { output = ''; }
            if (!this.mask) {
                // Without a mask we have nothing to do
                return output;
            }
            var formatted = '';
            var rawPos = 0;
            this.mask.some(function (maskChar) {
                if (rawPos >= output.length) {
                    return true;
                }
                if (_this.maskChars.hasOwnProperty(maskChar)) {
                    formatted += output.charAt(rawPos++);
                }
                else {
                    formatted += maskChar;
                }
            });
            return formatted;
        };
        SimpleInputMask.prototype.parser = function (input) {
            var _this = this;
            if (input === void 0) { input = ''; }
            if (!this.mask) {
                // Without a mask we have nothing to do
                return input;
            }
            var inputChars = input.split('');
            var newInputLength = input.length;
            var parsedParts = [];
            this.mask.every(function (maskChar) {
                var nextInputChar = inputChars[0];
                if (_this.maskChars.hasOwnProperty(maskChar)) {
                    while (inputChars.length && !inputChars[0].match(_this.maskChars[maskChar])) {
                        inputChars.shift();
                    }
                    if (inputChars.length) {
                        parsedParts.push(inputChars.shift());
                    }
                }
                else if (nextInputChar === maskChar) {
                    inputChars.shift();
                }
                return inputChars.length > 0;
            });
            var parsed = parsedParts.join('');
            var formatted = this.formatter(parsed);
            var caretPosition = this.elem[0].selectionStart;
            if (newInputLength > this.lastLen) {
                var maskChar = this.mask[caretPosition - 1];
                var currentPositionIsEditable = this.maskChars.hasOwnProperty(maskChar);
                if (currentPositionIsEditable) {
                    if (!input.charAt(caretPosition - 1).match(this.maskChars[maskChar])) {
                        caretPosition--;
                    }
                }
                else {
                    while (caretPosition < formatted.length
                        && !this.maskChars.hasOwnProperty(this.mask[caretPosition - 1])) {
                        caretPosition++;
                    }
                }
            }
            this.lastLen = formatted.length;
            this.elem.val(formatted);
            this.ctrl.$setViewValue(formatted);
            if (this.document.activeElement === this.elem[0]) {
                this.elem[0].selectionStart = this.elem[0].selectionEnd = caretPosition;
            }
            return parsed;
        };
        SimpleInputMask.prototype.validator = function () {
            if (typeof this.ctrl.$viewValue === 'undefined' || this.ctrl.$viewValue === '') {
                // No validation for an undefined model value
                return true;
            }
            if (!this.mask) {
                return true;
            }
            else {
                return this.ctrl.$viewValue.length === this.mask.length;
            }
        };
        return SimpleInputMask;
    })();
    NZInputFormats.SimpleInputMask = SimpleInputMask;
    NZInputFormats.module.directive('nzSimpleInputMask', ['$document', SimpleInputMask.Factory]);
})(NZInputFormats || (NZInputFormats = {}));

///<reference path="angular-nz-input-formats.ts"/>
///<reference path="simple-input-mask.directive.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NZInputFormats;
(function (NZInputFormats) {
    var NZBankNumber = (function (_super) {
        __extends(NZBankNumber, _super);
        function NZBankNumber() {
            _super.call(this);
            this.shortMask = '99-9999-9999999-99';
            this.longMask = '99-9999-9999999-999';
            this.options = {
                mask: null,
                strict: true
            };
            this.prefixes = {
                '01': {
                    // ANZ
                    from: 1,
                    to: 5699
                },
                '12': {
                    // ASB
                    from: 3000,
                    to: 3499
                },
                '02': {
                    // BNZ / The Cooperative Bank
                    from: 1,
                    to: 1299
                },
                '31': {
                    // Citibank
                    from: 2800,
                    to: 2849
                },
                '25': {
                    // ANZ, ex National Bank of New Zealand (ex Countrywide)
                    from: 2500,
                    to: 2599
                },
                '30': {
                    // HSBC
                    from: 2900,
                    to: 2956
                },
                '38': {
                    // Kiwibank
                    from: 9000,
                    to: 9499
                },
                '08': {
                    // National Australia Bank
                    from: 0,
                    to: 9999
                },
                '06': {
                    // ANZ, ex National Bank of New Zealand
                    from: 1,
                    to: 1499
                },
                '11': {
                    // ANZ, ex PostBank
                    from: 5000,
                    to: 8999
                },
                '21': {
                    // Trust Bank Auckland
                    from: 4800,
                    to: 4899
                },
                '15': {
                    // TSB Bank
                    from: 3900,
                    to: 3999
                },
                '18': {
                    // Trust Bank Bay of Plenty
                    from: 3500,
                    to: 3599
                },
                '16': {
                    // Trust Bank Canterbury
                    from: 4400,
                    to: 4499
                },
                '20': {
                    // Trust Bank Central
                    from: 4100,
                    to: 4199
                },
                '14': {
                    // Trust Bank Otago
                    from: 4700,
                    to: 4799
                },
                '13': {
                    // Trust Bank Southland
                    from: 4900,
                    to: 4799
                },
                '19': {
                    // Trust Bank South Canterbury
                    from: 4600,
                    to: 4649
                },
                '17': {
                    // Trust Bank Waikato
                    from: 3300,
                    to: 3399
                },
                '22': {
                    // Trust Bank Wanganui
                    from: 4000,
                    to: 4049
                },
                '23': {
                    // Trust Bank Wellington
                    from: 3700,
                    to: 3799
                },
                '29': {
                    // United Bank
                    from: 0,
                    to: 9999
                },
                '24': {
                    // Westland Bank
                    from: 4300,
                    to: 4349
                },
                '03': {
                    // Westpac / RaboBank New Zealand / NZACU
                    from: 1,
                    to: 1999
                }
            };
            this.setMask(this.shortMask);
        }
        NZBankNumber.Factory = function ($document) {
            var inst = new NZBankNumber();
            inst.document = $document[0];
            return inst;
        };
        NZBankNumber.prototype.parser = function (input) {
            if (input.replace(/\D/g, '').length <= 15) {
                this.setMask(this.shortMask);
            }
            else {
                this.setMask(this.longMask);
            }
            var parsed = _super.prototype.parser.call(this, input);
            if (parsed.length === 15) {
                // We need to pad the last two digits with a zero
                parsed = parsed.substr(0, 13) + '0' + parsed.substr(-2);
            }
            return parsed;
        };
        NZBankNumber.prototype.validator = function () {
            var superVal = _super.prototype.validator.call(this);
            if (!this.options['strict']) {
                return superVal;
            }
            var value = this.ctrl.$viewValue;
            if (value === 'undefined' || value === '') {
                // No validation for an undefined model value
                return true;
            }
            value = value.replace(/\D/g, '');
            if (value.length < 15 || value.length > 16) {
                return false;
            }
            var bankCode = value.substr(0, 2);
            if (this.prefixes.hasOwnProperty(bankCode)) {
                var bank = this.prefixes[bankCode];
                var branch = value.substr(2, 4);
                if (branch.length === 4) {
                    var branchNumber = Number(branch);
                    return superVal && branchNumber >= bank.from && branchNumber <= bank.to;
                }
            }
            return false;
        };
        return NZBankNumber;
    })(NZInputFormats.SimpleInputMask);
    NZInputFormats.NZBankNumber = NZBankNumber;
    NZInputFormats.module.directive('nzBankNumber', ['$document', NZBankNumber.Factory]);
})(NZInputFormats || (NZInputFormats = {}));

///<reference path="angular-nz-input-formats.ts"/>
///<reference path="simple-input-mask.directive.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NZInputFormats;
(function (NZInputFormats) {
    var NZIrdNumber = (function (_super) {
        __extends(NZIrdNumber, _super);
        function NZIrdNumber() {
            _super.call(this);
            this.shortMask = '99-999-999';
            this.longMask = '999-999-999';
            this.setMask(this.shortMask);
        }
        NZIrdNumber.Factory = function ($document) {
            var inst = new NZIrdNumber();
            inst.document = $document[0];
            return inst;
        };
        NZIrdNumber.prototype.parser = function (input) {
            if (input.replace(/\D/g, '').length <= 8) {
                this.setMask(this.shortMask);
            }
            else {
                this.setMask(this.longMask);
            }
            return _super.prototype.parser.call(this, input);
        };
        NZIrdNumber.prototype.validator = function () {
            if (typeof this.ctrl.$viewValue === 'undefined' || this.ctrl.$viewValue === '') {
                // No validation for an undefined model value
                return true;
            }
            var input = NZIrdNumber.Extract(this.ctrl.$viewValue);
            if (!input) {
                return false;
            }
            if (!NZIrdNumber.CheckValidRange(input)) {
                return false;
            }
            // Remove the check digit
            var base = input.substr(0, 8);
            return NZIrdNumber.CalculateCheckDigit(base, input.substr(-1));
        };
        NZIrdNumber.Extract = function (input) {
            var matches = String(input).trim().match(/(?:\d{8,9}|\d{2,3}-\d{3}-\d{3})/);
            if (matches && matches.length) {
                // Pad to 9 digits with a leading 0, if required
                return ('0' + matches[0].replace(/-/g, '')).substr(-9);
            }
            else {
                return null;
            }
        };
        NZIrdNumber.CheckValidRange = function (input) {
            var asNumber = Number(input);
            return asNumber >= 10000000 && asNumber <= 150000000;
        };
        NZIrdNumber.CalculateCheckDigit = function (input, expected) {
            var weighting = [3, 2, 7, 6, 5, 4, 3, 2];
            var checkDigit = NZIrdNumber.CalculateCheckDigitFor(weighting, input);
            if (checkDigit === 10) {
                return NZIrdNumber.ReCalculateCheckDigit(input, expected);
            }
            else {
                return checkDigit === Number(expected);
            }
        };
        NZIrdNumber.ReCalculateCheckDigit = function (input, expected) {
            var weighting = [7, 4, 3, 2, 5, 2, 7, 6];
            var checkDigit = NZIrdNumber.CalculateCheckDigitFor(weighting, input);
            if (checkDigit === 10) {
                return false;
            }
            else {
                return checkDigit === Number(expected);
            }
        };
        NZIrdNumber.CalculateCheckDigitFor = function (weighting, input) {
            var sum = 0;
            for (var i = 0; i < weighting.length; i++) {
                sum += Number(input.charAt(i)) * weighting[i];
            }
            var remainder = sum % 11;
            if (remainder === 0) {
                return 0;
            }
            else {
                return 11 - remainder;
            }
        };
        return NZIrdNumber;
    })(NZInputFormats.SimpleInputMask);
    NZInputFormats.NZIrdNumber = NZIrdNumber;
    NZInputFormats.module.directive('nzIrdNumber', ['$document', NZIrdNumber.Factory]);
})(NZInputFormats || (NZInputFormats = {}));

///<reference path="angular-nz-input-formats.ts"/>
///<reference path="simple-input-mask.directive.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NZInputFormats;
(function (NZInputFormats) {
    var NZPhoneNumber = (function (_super) {
        __extends(NZPhoneNumber, _super);
        function NZPhoneNumber() {
            _super.call(this);
            this.defaultMask = '999999999999';
            this.mobileMask = '999 999 999 999';
            this.landlineMask = '99 999 9999';
            this.specialMask = '9999 999 999 9999';
            this.minLength = 0;
            this.setMask(this.defaultMask);
        }
        NZPhoneNumber.Factory = function ($document) {
            var inst = new NZPhoneNumber();
            inst.document = $document[0];
            return inst;
        };
        NZPhoneNumber.prototype.parser = function (input) {
            var raw = input.replace(/\D/g, '');
            if (raw.match(/^0[89]0/)) {
                this.setMask(this.specialMask);
                this.minLength = 10;
            }
            else if (raw.match(/^02/)) {
                this.setMask(this.mobileMask);
                this.minLength = 9;
            }
            else if (raw.match(/^0[34679]/)) {
                this.setMask(this.landlineMask);
                this.minLength = 9;
            }
            else {
                this.setMask(this.defaultMask);
                this.minLength = 9;
            }
            return _super.prototype.parser.call(this, input);
        };
        NZPhoneNumber.prototype.validator = function () {
            var value = this.ctrl.$viewValue;
            if (value === 'undefined' || value === '') {
                // No validation for an undefined model value
                return true;
            }
            value = value.replace(/\D/g, '');
            return value.length >= this.minLength;
        };
        return NZPhoneNumber;
    })(NZInputFormats.SimpleInputMask);
    NZInputFormats.NZPhoneNumber = NZPhoneNumber;
    NZInputFormats.module.directive('nzPhoneNumber', ['$document', NZPhoneNumber.Factory]);
})(NZInputFormats || (NZInputFormats = {}));
})(window, window.angular);