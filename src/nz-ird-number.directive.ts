///<reference path="angular-nz-input-formats.ts"/>
///<reference path="simple-input-mask.directive.ts"/>

module NZInputFormats {

    export class NZIrdNumber extends SimpleInputMask {
        shortMask:string = '99-999-999';
        longMask:string = '999-999-999';

        public directiveName:string = 'nzIrdNumber';

        constructor() {
            super();
            this.setMask(this.shortMask);
        }

        public static Directive($document):angular.IDirective {
            return SimpleInputMask.Directive($document, NZIrdNumber);
        }

        protected updateMask(value:string):void {
            if(!value) {
                return;
            }

            value = String(value || '');
            if (value.replace(/\D/g, '').length <= 8) {
                this.setMask(this.shortMask);
            } else {
                this.setMask(this.longMask);
            }
        }

        protected validator() {
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
        }

        private static Extract(input) {
            var matches = String(input).trim().match(/(?:\d{8,9}|\d{2,3}-\d{3}-\d{3})/);
            if (matches && matches.length) {
                // Pad to 9 digits with a leading 0, if required
                return ('0' + matches[0].replace(/-/g, '')).substr(-9);
            } else {
                return null;
            }
        }

        private static CheckValidRange(input) {
            var asNumber = Number(input);
            return asNumber >= 10000000 && asNumber <= 150000000;
        }

        private static CalculateCheckDigit(input, expected) {
            var weighting = [3, 2, 7, 6, 5, 4, 3, 2];
            var checkDigit = NZIrdNumber.CalculateCheckDigitFor(weighting, input);
            if (checkDigit === 10) {
                return NZIrdNumber.ReCalculateCheckDigit(input, expected);
            } else {
                return checkDigit === Number(expected);
            }
        }

        private static ReCalculateCheckDigit(input, expected) {
            var weighting = [7, 4, 3, 2, 5, 2, 7, 6];
            var checkDigit = NZIrdNumber.CalculateCheckDigitFor(weighting, input);
            if (checkDigit === 10) {
                return false;
            } else {
                return checkDigit === Number(expected);
            }
        }

        private static CalculateCheckDigitFor(weighting, input) {
            var sum = 0;
            for (var i = 0; i < weighting.length; i++) {
                sum += Number(input.charAt(i)) * weighting[i];
            }

            var remainder = sum % 11;
            if (remainder === 0) {
                return 0;
            } else {
                return 11 - remainder;
            }
        }

    }

    module.directive('nzIrdNumber', ['$document', NZIrdNumber.Directive]);
}
