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
            if(typeof output === 'undefined' || output === null || output === '') {
                return output;
            }
            
            var raw = NZPhoneNumber.sanitise(output);
            
            var intl = raw.substr(0, 2) === '64';
            if(intl) {
               raw = '0' + raw.substr(2); 
            }
             
            if(raw.match(/^0[89]0/)) {
                this.setMask(intl ? this.intlSpecialMask : this.specialMask);
                this.minLength = intl ? 11 : 10;
            } else if(raw.substr(0, 2) === '02') {
                this.setMask(intl ? this.intlMobileMask : this.mobileMask);
                this.minLength = intl ? 10 : 9;
            } else if (raw.match(/^0[345679]/)) {
                this.setMask(intl ? this.intlLandlineMask : this.landlineMask);
                this.minLength = intl ? 10 : 9;
            } else {
                this.setMask(this.defaultMask);
                this.minLength = 9;
            }
            
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
