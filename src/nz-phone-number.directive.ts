///<reference path="angular-nz-input-formats.ts"/>
///<reference path="simple-input-mask.directive.ts"/>

module NZInputFormats {

    export class NZPhoneNumber extends SimpleInputMask {
        defaultMask:string = '999999999999';
        mobileMask:string = '999 999 999999';
        landlineMask:string = '99 999 9999';
        specialMask:string = '9999 999 999 9999';

        public directiveName:string = 'nzPhoneNumber';
        
        minLength = 0;

        constructor() {
            super();
            this.setMask(this.defaultMask);
        }

        public static Directive($document):angular.IDirective {
            return SimpleInputMask.Directive($document, NZPhoneNumber);
        }

        protected parser(input:string):string {
            var raw = NZPhoneNumber.sanitise(input);
            if(raw.match(/^0[89]0/)) {
                this.setMask(this.specialMask);
                this.minLength = 10;
            } else if(raw.match(/^02/)) {
                this.setMask(this.mobileMask);
                this.minLength = 9;
            } else if (raw.match(/^0[34679]/)) {
                this.setMask(this.landlineMask);
                this.minLength = 9;
            } else {
                this.setMask(this.defaultMask);
                this.minLength = 9;
            }
            
            return super.parser(String(input));
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
