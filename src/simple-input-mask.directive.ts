///<reference path="../definitions\angularjs\angular.d.ts"/>
///<reference path="angular-nz-input-formats.ts"/>

interface ObserveCallback {
    (value?:any): any
}

module NZInputFormats {

    export interface MaskDictionary {
        [char:string]: RegExp
    }

    export class SimpleInputMask {
        // Directive properties
        public require = 'ngModel';
        public restrict = 'A';
        public link:Function = null;
        public directiveName:string = 'nzSimpleInputMask';

        protected static Document:Document = null;

        protected options:{[key:string]:any} = {
            mask: null,
            validateOnLoad: true
        };

        private mask:string[] = null;
        private maskChars:MaskDictionary = {
            '*': /./,
            'A': /[A-Za-z]/,
            '9': /[0-9]/
        };

        protected scope:angular.IScope = null;
        protected elem:angular.IAugmentedJQuery = null;
        protected ctrl:any = null;
        protected document:Document = null;

        private lastLen:number = 0;

        constructor(mask:string = null, maskChars:MaskDictionary = null) {
            this.setMask(mask);
            if (maskChars) {
                this.maskChars = maskChars;
            }
            this.link = angular.bind(this, this.doLink);
        }

        protected setMask(mask:string):void {
            if (mask !== this.options['mask']) {
                this.mask = mask.split('');
                this.options['mask'] = mask;
                if (this.elem) {
                    this.parser(this.elem.val());
                }
            }
        }

        public static Directive($document, T = SimpleInputMask):angular.IDirective {
            SimpleInputMask.Document = $document[0];
            return {
                require: 'ngModel',
                restrict: 'A',
                link: function link(scope:angular.IScope, elem:angular.IAugmentedJQuery, attrs:angular.IAttributes,
                                    ctrl:any, transclude:angular.ITranscludeFunction) {
                    var inst = new T();
                    inst.document = SimpleInputMask.Document;
                    return inst.doLink(scope, elem, attrs, ctrl, transclude);
                }
            };
        }

        protected doLink(scope:angular.IScope, elem:angular.IAugmentedJQuery, attrs:angular.IAttributes, ctrl:any,
                         transclude:angular.ITranscludeFunction):void {
            this.scope = scope;
            this.elem = elem;
            this.ctrl = ctrl;

            attrs.$observe(this.directiveName, <ObserveCallback>angular.bind(this, this.processAttributeValue));
            this.processAttributeValue(attrs[this.directiveName]);

            ctrl.$formatters.push(angular.bind(this, this.formatter));
            ctrl.$parsers.push(angular.bind(this, this.parser));
            if (angular.isObject(ctrl.$validators) && this.options['validateOnLoad']) {
              ctrl.$validators[this.directiveName] = angular.bind(this, this.validator);
            }
        }

        protected processAttributeValue(value) {
            var options = this.scope.$eval(value);
            if (options) {
                if (options['mask']) {
                    this.setMask(options['mask']);
                }
                this.options = angular.extend(this.options, options);
            }
        }

        protected updateMask(value):void {
        }

        protected formatter(output:string = ''):string {
            if (!output) {
                return output;
            }

            this.updateMask(output);
            if (!this.mask) {
                // Without a mask we have nothing to do
                return output;
            }

            output = String(output);
            var formatted:string = '';
            var rawPos:number = 0;
            this.mask.some((maskChar) => {
                if (rawPos >= output.length) {
                    return true;
                }
                if (this.maskChars.hasOwnProperty(maskChar)) {
                    formatted += output.charAt(rawPos++);
                } else {
                    formatted += maskChar;
                }
            });
            return formatted;
        }

        protected parser(input:string = ''):string {
            if (!input) {
                return this.triggerValidation(input);
            }

            this.updateMask(input);
            if (!this.mask) {
                // Without a mask we have nothing to do
                return input;
            }

            var inputChars:string[] = (input || '').split('');
            var newInputLength:number = input.length;
            var parsedParts:string[] = [];
            var elem:HTMLInputElement = <HTMLInputElement>this.elem[0];

            this.mask.every((maskChar:string, index) => {
                var nextInputChar:string = inputChars[0];

                if (this.maskChars.hasOwnProperty(maskChar)) {
                    while (inputChars.length) {
                        if (this.isCharacterValidInMask(inputChars[0], this.mask)) {
                            if (!inputChars[0].match(this.maskChars[maskChar])) {
                                inputChars.shift();
                            } else {
                                break;
                            }
                        } else {
                            // If we find a character that will never match the rest of our mask, bail
                            // and discard the rest of the input
                            return false;
                        }
                    }
                    if (inputChars.length) {
                        parsedParts.push(inputChars.shift());
                    }
                } else if (nextInputChar === maskChar) {
                    inputChars.shift();
                }

                return inputChars.length > 0;
            });
            var parsed:string = parsedParts.join('');

            var formatted:string = this.formatter(parsed);
            var caretPosition:number = elem.selectionStart;

            if (newInputLength > this.lastLen) {
                var maskChar:string = this.mask[caretPosition - 1];
                var currentPositionIsEditable:boolean = this.maskChars.hasOwnProperty(maskChar);
                if (currentPositionIsEditable) {
                    if (!input.charAt(caretPosition - 1).match(this.maskChars[maskChar])) {
                        caretPosition--;
                    }
                } else {
                    while (caretPosition < formatted.length
                    && !this.maskChars.hasOwnProperty(this.mask[caretPosition - 1])) {
                        caretPosition++;
                    }
                }
            }

            this.lastLen = formatted.length;

            this.elem.val(formatted);
            this.ctrl.$viewValue = formatted;
            this.ctrl.$render();

            if (this.document.activeElement === elem) {
                elem.selectionStart = elem.selectionEnd = caretPosition;
            }

            return this.triggerValidation(parsed);
        }

        private triggerValidation(currentValue) {
            if(!angular.isObject(this.ctrl.$validators) || !this.options['validateOnLoad']) {
                var valid = this.validator();
                this.ctrl.$setValidity(this.directiveName, valid);
                // Emulate Angular 1.3 model validation behaviour
                return valid ? currentValue : '';
            }
            return currentValue;
        }

        private isCharacterValidInMask(character, mask) {
            return mask.some((maskChar) => {
                return this.maskChars.hasOwnProperty(maskChar) ?
                    character.match(this.maskChars[maskChar]) : character === maskChar;
            });
        }

        protected validator() {
            var value = this.ctrl.$viewValue;
            if (angular.isUndefined(value) || value === null || value === '' || value !== value /*NaN*/) {
              // No validation for an undefined model value
              return true;
            }

            if (!this.mask) {
                return true;
            } else {
                return this.ctrl.$viewValue && this.ctrl.$viewValue.length === this.mask.length;
            }
        }

    }

    module.directive('nzSimpleInputMask', ['$document', SimpleInputMask.Directive]);
}
