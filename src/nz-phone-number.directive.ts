///<reference path="angular-nz-input-formats.ts"/>
///<reference path="simple-input-mask.directive.ts"/>

module NZInputFormats {

    export class NZPhoneNumber extends SimpleInputMask {
        defaultMask:string = '999999999999';
        mobileMask:string = '999 999 999 999';
        landlineMask:string = '99 999 9999';
        specialMask:string = '9999 999 999 9999';
        
        minLength = 0;

        constructor() {
            super();
            this.setMask(this.defaultMask);
        }

        public static Factory($document):NZPhoneNumber {
            var inst = new NZPhoneNumber();
            inst.document = $document[0];
            return inst;
        }

        protected parser(input:string):string {
            var raw = input.replace(/\D/g, '');
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
            
            return super.parser(input);
        }

        protected validator() {
            var value = this.ctrl.$viewValue;
            if (value === 'undefined' || value === '') {
                // No validation for an undefined model value
                return true;
            }

            value = value.replace(/\D/g, '');
            return value.length >= this.minLength;
        }

    }

    module.directive('nzPhoneNumber', ['$document', NZPhoneNumber.Factory]);
}
