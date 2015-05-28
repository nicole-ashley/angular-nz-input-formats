///<reference path="angular-nz-input-formats.ts"/>
///<reference path="simple-input-mask.directive.ts"/>

module NZInputFormats {

    export class NZPhoneNumber extends SimpleInputMask {
        defaultMask:string = '9999999999999';
        mobileMask:string = '999 999 999999';
        intlMobileMask:string = '9999 999 999999';
        landlineMask:string = '99 999 9999';
        intlLandlineMask:string = '999 999 9999';
        specialMask:string = '9999 999 999 9999';
        intlSpecialMask:string = '99999 999 999 9999';

        public directiveName:string = 'nzPhoneNumber';

        minLength = 0;

        constructor() {
            super();
            this.setMask(this.defaultMask);
        }

        public static Directive($document):angular.IDirective {
            return SimpleInputMask.Directive($document, NZPhoneNumber);
        }

        protected formatter(output:string):string {
            if (!output) {
                return output;
            }

            var raw = NZPhoneNumber.sanitise(output);

            if (angular.isDefined(this.options['intl'])) {
                if (this.options['intl']) {
                    raw = raw.match(/^(?:64.*|6)?/)[0];
                } else {
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
            } else if (raw.substr(0, 2) === '02') {
                type = 'mobile';
                this.setMask(intl ? this.intlMobileMask : this.mobileMask);
                this.minLength = intl ? 10 : 9;
            } else if (raw.match(/^0[345679]/)) {
                type = 'landline';
                this.setMask(intl ? this.intlLandlineMask : this.landlineMask);
                this.minLength = intl ? 10 : 9;
            } else {
                type = 'other';
                this.setMask(this.defaultMask);
                this.minLength = 9;
            }

            switch (this.options['type']) {
                case 'special':
                    raw = raw.match(/^(?:0[89]0.*|0[89]|0)?/)[0];
                    break;
                case 'mobile':
                    raw = raw.match(/^(?:02[1257].*|02|0)?/)[0];
                    break;
                case 'landline':
                    raw = raw.match(/^(?:0[345679].*|0)?/)[0];
                    break;
            }

            output = intl ? raw.replace(/^0/, intl[0]) : raw;

            return super.formatter(output);
        }

        protected validator() {
            var value = NZPhoneNumber.sanitise(this.ctrl.$viewValue);
            return value.length === 0 || value.length >= this.minLength;
        }

        private static sanitise(input) {
            return String(input).replace(/\D/g, '');
        }

    }

    module.directive('nzPhoneNumber', ['$document', NZPhoneNumber.Directive]);
}
