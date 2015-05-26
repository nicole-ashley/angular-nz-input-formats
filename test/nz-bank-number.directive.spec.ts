///<reference path="..\definitions\jasmine\jasmine.d.ts"/>
///<reference path="..\definitions\angularjs\angular.d.ts"/>
///<reference path="..\definitions\angularjs\angular-mocks.d.ts"/>

describe('NZ Bank Number', () => {

    var $scope,
        $compile,
        compileElement = (html) => {
            var element = $compile(html)($scope);
            $scope.$digest();
            return element;
        };

    beforeEach(module('nzInputFormats'));
    beforeEach(inject((_$rootScope_, _$compile_) => {
        $scope = _$rootScope_;
        $compile = _$compile_;
    }));

    var inputHtml = '<form name="test"><input name="input" ng-model="x" nz-bank-number="{{options}}" /></form>';


    describe('directive-level validation', () => {

        it('is limited to attribute invocation', () => {
            var naTemplates = [
                '<div class="nz-bank-number"></div>',
                '<nz-bank-number></nz-bank-number>'
            ];
            spyOn($scope, '$watch');

            naTemplates.forEach((template) => {
                compileElement(template);
                expect(() => compileElement(template)).not.toThrow();
            });
        });

    });


    describe('behaviour', () => {

        it('formats a short bank account number correctly', () => {
            var input = compileElement(inputHtml).find('input');

            input.val('012345678901234').triggerHandler('input');

            expect(input.val()).toBe('01-2345-6789012-34');
        });

        it('formats a long bank account number correctly', () => {
            var input = compileElement(inputHtml).find('input');

            input.val('0123456789012345').triggerHandler('input');

            expect(input.val()).toBe('01-2345-6789012-345');
        });

    });


    describe('model validation', () => {

        var compiled;

        beforeEach(() => {
            compiled = compileElement(inputHtml);
        });

        it('returns true if no model value has been defined', () => {
            expect($scope.simpleInputMask).toBeUndefined();
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });

        it('returns true if the model value is an empty string', () => {
            compiled.find('input').val('').triggerHandler('input');
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });

        it('returns false if the input is too short', () => {
            compiled.find('input').val('01234567890123').triggerHandler('input');

            expect(compiled.hasClass('ng-invalid')).toBe(true);
        });

        it('returns true when the input is the correct length', () => {
            compiled.find('input').val('012345678901234').triggerHandler('input');
            expect(compiled.hasClass('ng-valid')).toBe(true);

            compiled.find('input').val('0123456789012345').triggerHandler('input');
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });
        
        it('does not strict match by default', () => {
            // Outside ANZ branch range
            compiled.find('input').val('01-6789-0123456-78').triggerHandler('input');
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });

        describe('strict matching', () => {
            beforeEach(() => $scope.options = '{strict: true}');

            it('returns true when the bank and branch are valid', () => {
                // Within ANZ branch range
                compiled.find('input').val('01-2345-6789012-34').triggerHandler('input');
                expect(compiled.hasClass('ng-valid')).toBe(true);

                // Within Westpac branch range
                compiled.find('input').val('03-1234-5678901-23').triggerHandler('input');
                expect(compiled.hasClass('ng-valid')).toBe(true);
            });

            it('returns false when the bank and branch are invalid', () => {
                // Outside ANZ branch range
                compiled.find('input').val('01-6789-0123456-78').triggerHandler('input');
                expect(compiled.hasClass('ng-invalid')).toBe(true);

                // Outside Westpac branch range
                compiled.find('input').val('03-4567-8901234-56').triggerHandler('input');
                expect(compiled.hasClass('ng-invalid')).toBe(true);
            });

        });

    });


});
