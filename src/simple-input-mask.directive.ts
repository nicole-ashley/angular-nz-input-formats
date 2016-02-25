///<reference path="../definitions\angularjs\angular.d.ts"/>
///<reference path="angular-nz-input-formats.ts"/>

interface ObserveCallback {
    (value?: any): any
}

module NZInputFormats {

    export interface MaskDictionary {
        [char:string]: RegExp
    }

    export class SimpleInputMask {
        // Directive properties
        public require = 'ngModel';
        public restrict = 'A';
        public link: Function = null;
        public directiveName = 'nzSimpleInputMask';

        protected static Document: Document = null;

        protected options: {[key:string]:any} = {
            mask: null,
            validateOnLoad: true
        };

        private mask: string[] = null;
        private maskChars: MaskDictionary = {
            '*': /./,
            'A': /[A-Za-z]/,
            '9': /[0-9]/
        };

        protected scope: angular.IScope = null;
        protected elem: angular.IAugmentedJQuery = null;
        protected ctrl: any = null;
        protected document: Document = null;

        private lastLen = 0;

        constructor(mask: string = null, maskChars: MaskDictionary = null) {
            this.setMask(mask);
            if (maskChars) {
                this.maskChars = maskChars;
            }
            this.link = angular.bind(this, this.doLink);
        }

        protected setMask(mask: string): void {
            if (mask !== this.options['mask']) {
                this.mask = mask.split('');
                this.options['mask'] = mask;
                if (this.elem) {
                    this.parser(this.elem.val());
                }
            }
        }

        public static Directive($document, T = SimpleInputMask): angular.IDirective {
            SimpleInputMask.Document = $document[0];
            return {
                require: 'ngModel',
                restrict: 'A',
                link: function link(
                    scope: angular.IScope, elem: angular.IAugmentedJQuery, attrs: angular.IAttributes,
                    ctrl: any, transclude: angular.ITranscludeFunction
                ) {
                    var inst = new T();
                    inst.document = SimpleInputMask.Document;
                    return inst.doLink(scope, elem, attrs, ctrl, transclude);
                }
            };
        }

        protected doLink(
            scope: angular.IScope, elem: angular.IAugmentedJQuery, attrs: angular.IAttributes, ctrl: any,
            transclude: angular.ITranscludeFunction
        ): void {
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

        protected updateMask(value): void {
        }

        protected formatter(output: string = ''): string {
            if (!output) {
                return output;
            }

            this.updateMask(output);
            if (!this.mask) {
                // Without a mask we have nothing to do
                return output;
            }

            return this.applyMaskToString(String(output));
        }

        private applyMaskToString(str: string): string {
            var formatted = '';
            var rawPos = 0;
            this.mask.some((maskChar) => {
                if (rawPos >= str.length) {
                    return true;
                }
                formatted += this.isMaskCharEditable(maskChar) ? str.charAt(rawPos++) : maskChar;
            });
            return formatted;
        }

        protected parser(input: string = ''): string {
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

            var cursorPosition = (<HTMLInputElement>this.elem[0]).selectionEnd;
            var newCursorPosition = this.calculateNewCursorPosition(input, formatted, cursorPosition);

            this.updateFieldWith(formatted);
            this.updateCursorPositionIfElementIsActive(newCursorPosition);

            return this.triggerValidation(parsed);
        }

        private removeMaskFromString(str: string) {
            var inputChars = (str || '').split('');
            var parsedParts: string[] = [];

            this.mask.every((maskChar: string) => {
                if (this.isMaskCharEditable(maskChar)) {
                    inputChars = this.discardCharactersUntilNextMatch(inputChars, maskChar);
                    if (inputChars && inputChars.length) {
                        parsedParts.push(inputChars.shift());
                    }
                } else if (inputChars[0] === maskChar) {
                    inputChars.shift();
                }

                return inputChars && inputChars.length > 0;
            });
            return parsedParts.join('');
        }

        private discardCharactersUntilNextMatch(inputChars: string[], maskChar: string): string[] {
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
        }

        private isCharacterValidInMask(character, mask) {
            return mask.some((maskChar) => {
                return this.isMaskCharEditable(maskChar) ?
                    character.match(this.maskChars[maskChar]) : character === maskChar;
            });
        }

        private isMaskCharEditable(maskChar: string) {
            return this.maskChars.hasOwnProperty(maskChar);
        }

        private calculateNewCursorPosition(input: string, formatted: string, cursorPosition: number): number {
            if (input.length > this.lastLen) {
                if (this.isPositionEditable(cursorPosition)) {
                    cursorPosition = this.revertCursorMoveIfCharacterWasInvalid(input, cursorPosition);
                } else {
                    cursorPosition = this.getNextEditablePosition(cursorPosition, formatted.length);
                }
            }
            return cursorPosition;
        }

        private isPositionEditable(cursorPosition) {
            var maskChar = this.mask[cursorPosition - 1];
            return this.maskChars.hasOwnProperty(maskChar);
        }

        private revertCursorMoveIfCharacterWasInvalid(input: string, cursorPosition: number): number {
            var position = cursorPosition - 1;
            var maskCharPattern = this.maskChars[this.mask[position]];
            if (!input.charAt(position).match(maskCharPattern)) {
                cursorPosition--;
            }
            return cursorPosition;
        }

        private getNextEditablePosition(cursorPosition: number, length: number): number {
            while (cursorPosition < length && !this.isMaskCharEditable(this.mask[cursorPosition - 1])) {
                cursorPosition++;
            }
            return cursorPosition;
        }

        private updateFieldWith(formattedValue) {
            this.lastLen = formattedValue.length;
            this.elem.val(formattedValue);
            this.ctrl.$viewValue = formattedValue;
            this.ctrl.$commitViewValue();
        }

        private updateCursorPositionIfElementIsActive(cursorPosition) {
            var elem = <HTMLInputElement>this.elem[0];
            if (this.document.activeElement === elem) {
                elem.selectionStart = elem.selectionEnd = cursorPosition;
            }
        }

        private triggerValidation(currentValue) {
            if (!angular.isObject(this.ctrl.$validators) || !this.options['validateOnLoad']) {
                var valid = this.validator();
                this.ctrl.$setValidity(this.directiveName, valid);
                // Emulate Angular 1.3 model validation behaviour
                return valid ? currentValue : '';
            }
            return currentValue;
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
