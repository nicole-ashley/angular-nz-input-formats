///<reference path="..\definitions\jasmine\jasmine.d.ts"/>
///<reference path="..\definitions\angularjs\angular.d.ts"/>
///<reference path="..\definitions\angularjs\angular-mocks.d.ts"/>

describe('Simple Input Mask', () => {

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

    var inputHtml = '<form name="test"><input name="input" ng-model="x" nz-simple-input-mask="{{options}}" /></form>';


    describe('directive-level validation', () => {

        it('is limited to attribute invocation', () => {
            var naTemplates = [
                '<div class="nz-simple-input-mask"></div>',
                '<nz-simple-input-mask></nz-simple-input-mask>'
            ];
            spyOn($scope, '$watch');

            naTemplates.forEach((template) => {
                compileElement(template);
                expect(() => compileElement(template)).not.toThrow();
            });
        });

    });


    describe('configuration', () => {

        it('uses a mask given in its attribute value', () => {
            var input = compileElement(inputHtml).find('input');
            $scope.options = '{mask: "-A-9-*"}';

            input.val('a12').triggerHandler('input');

            expect(input.val()).toBe('-a-1-2');
        });

    });
    
    
    describe('behaviour', () => {
        
        it('selects valid input characters from left-to-right, discarding invalids', () => {
            var input = compileElement(inputHtml).find('input');
            $scope.options = '{mask: "9A9A"}';

            input.val('abc123def456ghi').triggerHandler('input');

            expect(input.val()).toBe('1d4g');
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

        it('returns false if the input is the incorrect length', () => {
            $scope.options = '{mask: "AAAA"}';
            compiled.find('input').val('abc').triggerHandler('input');

            expect(compiled.hasClass('ng-invalid')).toBe(true);
        });

    });


});
