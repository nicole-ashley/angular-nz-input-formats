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

        private prefixes:{[bank:string]:BranchRange} = {
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

        constructor() {
            super();
            this.setMask(this.shortMask);
        }

        public static Directive($document):angular.IDirective {
            return SimpleInputMask.Directive($document, NZBankNumber);
        }

        protected parser(input:string):string {
            if (input.replace(/\D/g, '').length <= 15) {
                this.setMask(this.shortMask);
            } else {
                this.setMask(this.longMask);
            }

            var parsed = super.parser(input);
            if (parsed.length === 15) {
                // We need to pad the last two digits with a zero
                parsed = parsed.substr(0, 13) + '0' + parsed.substr(-2);
            }
            return parsed;
        }

        protected validator() {
            var superVal = super.validator();

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
        }
    }

    module.directive('nzBankNumber', ['$document', NZBankNumber.Directive]);

}
