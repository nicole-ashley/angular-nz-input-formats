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


    describe('instantiation', () => {

        it('formats a short bank account number correctly', () => {
            $scope.x = '012345678901234';

            var input = compileElement(inputHtml).find('input');

            expect(input.val()).toBe('01-2345-6789012-34');
        });

        it('formats a long bank account number correctly', () => {
            $scope.x = '0123456789012345';

            var input = compileElement(inputHtml).find('input');

            expect(input.val()).toBe('01-2345-6789012-345');
        });

        it('disregards null values', () => {
            $scope.x = null;

            var input = compileElement(inputHtml).find('input');

            expect(input.val()).toBe('');
        });

        it('disregards NaN values', () => {
            $scope.x = NaN;

            var input = compileElement(inputHtml).find('input');

            expect(input.val()).toBe('');
        });

    });


    describe('interaction', () => {

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
            beforeEach(() => {
                $scope.options = '{strict: true}';
                $scope.$digest();
            });

            it('returns true when the bank account number is valid', () => {
                // Valid checksum
                compiled.find('input').val('11-1111-1111111-11').triggerHandler('input');
                expect(compiled.hasClass('ng-valid')).toBe(true);

                // Valid checksum
                compiled.find('input').val('03-1587-0050000-00').triggerHandler('input');
                expect(compiled.hasClass('ng-valid')).toBe(true);
            });

            it('returns false when the bank account number is invalid', () => {
                // Valid checksum but invalid bank number
                compiled.find('input').val('40-1587-0050000-00').triggerHandler('input');
                expect(compiled.hasClass('ng-invalid')).toBe(true);

                // Invalid checksum
                compiled.find('input').val('03-1586-0050010-00').triggerHandler('input');
                expect(compiled.hasClass('ng-invalid')).toBe(true);
            });

        });

    });

});
