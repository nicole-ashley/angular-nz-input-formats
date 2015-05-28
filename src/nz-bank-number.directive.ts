///<reference path="angular-nz-input-formats.ts"/>
///<reference path="simple-input-mask.directive.ts"/>

module NZInputFormats {

    interface BranchRange {
        from:number;
        to:number;
    }

    export class NZBankNumber extends SimpleInputMask {
        private shortMask:string = '99-9999-9999999-99';
        private longMask:string = '99-9999-9999999-999';

        public directiveName:string = 'nzBankNumber';

        protected options:{[option:string]:any} = {
            mask: null,
            strict: false
        };

        private banks:string[] = [
            '01', '02', '03', '06', '08', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
            '24', '25', '29', '30', '31', '38'
        ];

        private checksumWeights:number[] = [6, 3, 7, 9, 0, 10, 5, 8, 4, 2, 1];

        constructor() {
            super();
            this.setMask(this.shortMask);
        }

        public static Directive($document):angular.IDirective {
            return SimpleInputMask.Directive($document, NZBankNumber);
        }

        protected updateMask(value:string):void {
            if(!value) {
                return;
            }

            value = String(value || '');
            if (value.replace(/\D/g, '').length <= 15) {
                this.setMask(this.shortMask);
            } else {
                this.setMask(this.longMask);
            }
        }

        protected validator() {
            var superVal:boolean = super.validator();

            var value = this.ctrl.$viewValue;
            if (angular.isUndefined(value) || value === null || value === '') {
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
        }

        protected checksum(accountNumber:string) {
            var checksumPart:string = accountNumber.substr(2, 11);
            if (checksumPart.length !== 11) {
                return false;
            }

            var checksum:number = checksumPart.split('').reduce((total:number, current:string, index:number) => {
                return total + (parseInt(current, 10) * this.checksumWeights[index]);
            }, 0);
            return checksum % 11 === 0;
        }
    }

    module.directive('nzBankNumber', ['$document', NZBankNumber.Directive]);

}
