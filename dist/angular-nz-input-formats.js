/*!
 * angular-nz-input-formats
 * Angular directives to validate and format NZ-specific input types
 * @version v0.5.2
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
            this.directiveName = 'nzSimpleInputMask';
            this.options = {
                mask: null,
                validateOnLoad: true
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
        SimpleInputMask.Directive = function ($document, T) {
            if (T === void 0) { T = SimpleInputMask; }
            SimpleInputMask.Document = $document[0];
            return {
                require: 'ngModel',
                restrict: 'A',
                link: function link(scope, elem, attrs, ctrl, transclude) {
                    var inst = new T();
                    inst.document = SimpleInputMask.Document;
                    return inst.doLink(scope, elem, attrs, ctrl, transclude);
                }
            };
        };
        SimpleInputMask.prototype.doLink = function (scope, elem, attrs, ctrl, transclude) {
            this.scope = scope;
            this.elem = elem;
            this.ctrl = ctrl;
            attrs.$observe(this.directiveName, angular.bind(this, this.processAttributeValue));
            this.processAttributeValue(attrs[this.directiveName]);
            ctrl.$formatters.push(angular.bind(this, this.formatter));
            ctrl.$parsers.push(angular.bind(this, this.parser));
            if (angular.isObject(ctrl.$validators) && this.options['validateOnLoad']) {
                ctrl.$validators[this.directiveName] = angular.bind(this, this.validator);
            }
        };
        SimpleInputMask.prototype.processAttributeValue = function (value) {
            var options = this.scope.$eval(value);
            if (options) {
                if (options['mask']) {
                    this.setMask(options['mask']);
                }
                this.options = angular.extend(this.options, options);
            }
        };
        SimpleInputMask.prototype.updateMask = function (value) {
        };
        SimpleInputMask.prototype.formatter = function (output) {
            if (output === void 0) { output = ''; }
            if (!output) {
                return output;
            }
            this.updateMask(output);
            if (!this.mask) {
                // Without a mask we have nothing to do
                return output;
            }
            return this.applyMaskToString(String(output));
        };
        SimpleInputMask.prototype.applyMaskToString = function (str) {
            var _this = this;
            var formatted = '';
            var rawPos = 0;
            this.mask.some(function (maskChar) {
                if (rawPos >= str.length) {
                    return true;
                }
                formatted += _this.isMaskCharEditable(maskChar) ? str.charAt(rawPos++) : maskChar;
            });
            return formatted;
        };
        SimpleInputMask.prototype.parser = function (input) {
            if (input === void 0) { input = ''; }
            if (!input) {
                return this.triggerValidation(input);
            }
            this.updateMask(input);
            if (!this.mask) {
                // Without a mask we have nothing to do
                return input;
            }
            var parsed = this.removeMaskFromString(input);
            var formatted = this.formatter(parsed);
            var cursorPosition = this.elem[0].selectionEnd;
            var newCursorPosition = this.calculateNewCursorPosition(input, formatted, cursorPosition);
            this.updateFieldWith(formatted);
            this.updateCursorPositionIfElementIsActive(newCursorPosition);
            return this.triggerValidation(parsed);
        };
        SimpleInputMask.prototype.removeMaskFromString = function (str) {
            var _this = this;
            var inputChars = (str || '').split('');
            var parsedParts = [];
            this.mask.every(function (maskChar) {
                if (_this.isMaskCharEditable(maskChar)) {
                    inputChars = _this.discardCharactersUntilNextMatch(inputChars, maskChar);
                    if (inputChars && inputChars.length) {
                        parsedParts.push(inputChars.shift());
                    }
                }
                else if (inputChars[0] === maskChar) {
                    inputChars.shift();
                }
                return inputChars && inputChars.length > 0;
            });
            return parsedParts.join('');
        };
        SimpleInputMask.prototype.discardCharactersUntilNextMatch = function (inputChars, maskChar) {
            inputChars = angular.copy(inputChars);
            var maskCharPattern = this.maskChars[maskChar];
            while (inputChars.length) {
                if (!this.isCharacterValidInMask(inputChars[0], this.mask)) {
                    // If we find a character that will never match the rest of our mask, bail
                    // and discard the rest of the input
                    return null;
                }
                if (inputChars[0].match(maskCharPattern)) {
                    break;
                }
                inputChars.shift();
            }
            return inputChars;
        };
        SimpleInputMask.prototype.isCharacterValidInMask = function (character, mask) {
            var _this = this;
            return mask.some(function (maskChar) {
                return _this.isMaskCharEditable(maskChar) ? character.match(_this.maskChars[maskChar]) : character === maskChar;
            });
        };
        SimpleInputMask.prototype.isMaskCharEditable = function (maskChar) {
            return this.maskChars.hasOwnProperty(maskChar);
        };
        SimpleInputMask.prototype.calculateNewCursorPosition = function (input, formatted, cursorPosition) {
            if (input.length > this.lastLen) {
                if (this.isPositionEditable(cursorPosition)) {
                    cursorPosition = this.revertCursorMoveIfCharacterWasInvalid(input, cursorPosition);
                }
                else {
                    cursorPosition = this.getNextEditablePosition(cursorPosition, formatted.length);
                }
            }
            return cursorPosition;
        };
        SimpleInputMask.prototype.isPositionEditable = function (cursorPosition) {
            var maskChar = this.mask[cursorPosition - 1];
            return this.maskChars.hasOwnProperty(maskChar);
        };
        SimpleInputMask.prototype.revertCursorMoveIfCharacterWasInvalid = function (input, cursorPosition) {
            var position = cursorPosition - 1;
            var maskCharPattern = this.maskChars[this.mask[position]];
            if (!input.charAt(position).match(maskCharPattern)) {
                cursorPosition--;
            }
            return cursorPosition;
        };
        SimpleInputMask.prototype.getNextEditablePosition = function (cursorPosition, length) {
            while (cursorPosition < length && !this.isMaskCharEditable(this.mask[cursorPosition - 1])) {
                cursorPosition++;
            }
            return cursorPosition;
        };
        SimpleInputMask.prototype.updateFieldWith = function (formattedValue) {
            this.lastLen = formattedValue.length;
            this.elem.val(formattedValue);
            this.ctrl.$viewValue = formattedValue;
            this.ctrl.$commitViewValue();
        };
        SimpleInputMask.prototype.updateCursorPositionIfElementIsActive = function (cursorPosition) {
            var elem = this.elem[0];
            if (this.document.activeElement === elem) {
                elem.selectionStart = elem.selectionEnd = cursorPosition;
            }
        };
        SimpleInputMask.prototype.triggerValidation = function (currentValue) {
            if (!angular.isObject(this.ctrl.$validators) || !this.options['validateOnLoad']) {
                var valid = this.validator();
                this.ctrl.$setValidity(this.directiveName, valid);
                // Emulate Angular 1.3 model validation behaviour
                return valid ? currentValue : '';
            }
            return currentValue;
        };
        SimpleInputMask.prototype.validator = function () {
            var value = this.ctrl.$viewValue;
            if (angular.isUndefined(value) || value === null || value === '' || value !== value) {
                // No validation for an undefined model value
                return true;
            }
            if (!this.mask) {
                return true;
            }
            else {
                return this.ctrl.$viewValue && this.ctrl.$viewValue.length === this.mask.length;
            }
        };
        SimpleInputMask.Document = null;
        return SimpleInputMask;
    })();
    NZInputFormats.SimpleInputMask = SimpleInputMask;
    NZInputFormats.module.directive('nzSimpleInputMask', ['$document', SimpleInputMask.Directive]);
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
            this.directiveName = 'nzBankNumber';
            this.options = {
                mask: null,
                strict: false
            };
            this.banks = [
                '01',
                '02',
                '03',
                '06',
                '08',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16',
                '17',
                '18',
                '19',
                '20',
                '21',
                '22',
                '23',
                '24',
                '25',
                '29',
                '30',
                '31',
                '38'
            ];
            this.checksumWeights = [6, 3, 7, 9, 0, 10, 5, 8, 4, 2, 1];
            this.setMask(this.shortMask);
        }
        NZBankNumber.Directive = function ($document) {
            return NZInputFormats.SimpleInputMask.Directive($document, NZBankNumber);
        };
        NZBankNumber.prototype.updateMask = function (value) {
            if (!value) {
                return;
            }
            value = String(value || '');
            if (value.replace(/[\s-]/g, '').length <= 15) {
                this.setMask(this.shortMask);
            }
            else {
                this.setMask(this.longMask);
            }
        };
        NZBankNumber.prototype.validator = function () {
            var superVal = _super.prototype.validator.call(this);
            var value = this.ctrl.$viewValue;
            if (angular.isUndefined(value) || value === null || value === '' || value !== value) {
                // No validation for an undefined model value
                return true;
            }
            value = value.replace(/\D/g, '');
            if (value.length < 15 || value.length > 16) {
                return false;
            }
            if (!this.options['strict']) {
                return superVal;
            }
            if (this.banks.indexOf(value.substr(0, 2)) === -1) {
                return false;
            }
            return this.checksum(value);
        };
        NZBankNumber.prototype.checksum = function (accountNumber) {
            var _this = this;
            var checksumPart = accountNumber.substr(2, 11);
            if (checksumPart.length !== 11) {
                return false;
            }
            var checksum = checksumPart.split('').reduce(function (total, current, index) {
                return total + (parseInt(current, 10) * _this.checksumWeights[index]);
            }, 0);
            return checksum % 11 === 0;
        };
        return NZBankNumber;
    })(NZInputFormats.SimpleInputMask);
    NZInputFormats.NZBankNumber = NZBankNumber;
    NZInputFormats.module.directive('nzBankNumber', ['$document', NZBankNumber.Directive]);
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
            this.directiveName = 'nzIrdNumber';
            this.setMask(this.shortMask);
        }
        NZIrdNumber.Directive = function ($document) {
            return NZInputFormats.SimpleInputMask.Directive($document, NZIrdNumber);
        };
        NZIrdNumber.prototype.updateMask = function (value) {
            if (!value) {
                return;
            }
            value = String(value || '');
            if (value.replace(/\D/g, '').length <= 8) {
                this.setMask(this.shortMask);
            }
            else {
                this.setMask(this.longMask);
            }
        };
        NZIrdNumber.prototype.validator = function () {
            var value = this.ctrl.$viewValue;
            if (angular.isUndefined(value) || value === null || value === '' || value !== value) {
                // No validation for an undefined model value
                return true;
            }
            var input = NZIrdNumber.Extract(value);
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
    NZInputFormats.module.directive('nzIrdNumber', ['$document', NZIrdNumber.Directive]);
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
            this.defaultMask = '9999999999999';
            this.mobileMask = '999 999 99999';
            this.intlMobileMask = '9999 999 99999';
            this.landlineMask = '99 999 9999';
            this.intlLandlineMask = '999 999 9999';
            this.specialMask = '9999 999 999 9999';
            this.intlSpecialMask = '99999 999 999 9999';
            this.directiveName = 'nzPhoneNumber';
            this.minLength = 0;
            this.setMask(this.defaultMask);
        }
        NZPhoneNumber.Directive = function ($document) {
            return NZInputFormats.SimpleInputMask.Directive($document, NZPhoneNumber);
        };
        NZPhoneNumber.prototype.formatter = function (output) {
            if (!output) {
                return output;
            }
            var raw = NZPhoneNumber.sanitise(output);
            if (angular.isDefined(this.options['intl'])) {
                if (this.options['intl']) {
                    raw = raw.match(/^(?:64.*|6)?/)[0];
                }
                else {
                    raw = raw.match(/^(?:0.*)?/)[0];
                }
            }
            var intl = raw.match(/^(64|6$)/);
            if (intl) {
                raw = '0' + raw.substr(2);
            }
            var type;
            if (raw.match(/^0[89]0/)) {
                type = 'special';
                this.setMask(intl ? this.intlSpecialMask : this.specialMask);
                this.minLength = intl ? 11 : 10;
            }
            else if (raw.substr(0, 2) === '02') {
                type = 'mobile';
                this.setMask(intl ? this.intlMobileMask : this.mobileMask);
                this.minLength = intl ? 10 : 9;
            }
            else if (raw.match(/^0[345679]/)) {
                type = 'landline';
                this.setMask(intl ? this.intlLandlineMask : this.landlineMask);
                this.minLength = intl ? 10 : 9;
            }
            else {
                type = 'other';
                this.setMask(this.defaultMask);
                this.minLength = 9;
            }
            switch (this.options['type']) {
                case 'special':
                    raw = raw.match(/^(?:0[89]0.*|0[89]|0)?/)[0];
                    break;
                case 'mobile':
                    raw = raw.match(/^(?:02.*|0)?/)[0];
                    break;
                case 'landline':
                    raw = raw.match(/^(?:0[345679].*|0)?/)[0];
                    break;
            }
            output = intl ? raw.replace(/^0/, intl[0]) : raw;
            return _super.prototype.formatter.call(this, output);
        };
        NZPhoneNumber.prototype.validator = function () {
            var value = this.ctrl.$viewValue;
            if (angular.isUndefined(value) || value === null || value === '' || value !== value) {
                // No validation for an undefined model value
                return true;
            }
            value = NZPhoneNumber.sanitise(value);
            return value.length === 0 || value.length >= this.minLength;
        };
        NZPhoneNumber.sanitise = function (input) {
            return String(input).replace(/\D/g, '');
        };
        return NZPhoneNumber;
    })(NZInputFormats.SimpleInputMask);
    NZInputFormats.NZPhoneNumber = NZPhoneNumber;
    NZInputFormats.module.directive('nzPhoneNumber', ['$document', NZPhoneNumber.Directive]);
})(NZInputFormats || (NZInputFormats = {}));
})(window, window.angular);