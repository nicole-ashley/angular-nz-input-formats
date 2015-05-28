///<reference path="..\definitions\jasmine\jasmine.d.ts"/>
///<reference path="..\definitions\angularjs\angular.d.ts"/>
///<reference path="..\definitions\angularjs\angular-mocks.d.ts"/>

describe('NZ IRD Number', function () {

    var $scope,
        $compile,
        compileElement = (html) => {
            var element = $compile(html)($scope);
            $scope.$digest();
            return element;
        };
    
    var suppliedValidValues = [
        '49-091-850',
        '35-901-981',
        '49-098-576',
        '136-410-132'
    ];
    var suppliedInvalidValues = [
        '136-410-133',
        '91-255-68'
    ];

    beforeEach(module('nzInputFormats'));

    beforeEach(inject(function (_$rootScope_, _$compile_) {
        $scope = _$rootScope_.$new();
        $compile = _$compile_;
    }));

    var inputHtml = '<form name="test"><input name="input" ng-model="x" nz-ird-number/></form>';


    describe('directive-level validation', function () {

        it('is limited to attribute invocation', function () {
            var spy = spyOn($scope, '$watch'),
                naTemplates = [
                    '<div class="nz-ird-number"></div>',
                    '<nz-ird-number></nz-ird-number>'
                ];

            for (var i = 0; i < naTemplates.length; i++) {
                $compile(naTemplates[i])($scope);
                $scope.$digest();
                expect(spy).not.toHaveBeenCalled();
            }
        });

    });


    describe('instantiation', () => {

        it('correctly formats a short IRD number', () => {
            $scope.x = '49091850';

            var input = compileElement(inputHtml).find('input');

            expect(input.val()).toBe('49-091-850');
        });

        it('correctly formats a long IRD number', () => {
            $scope.x = '136410132';

            var input = compileElement(inputHtml).find('input');

            expect(input.val()).toBe('136-410-132');
        });

    });


    describe('interaction', () => {

        it('correctly formats a short IRD number', () => {
            var input = compileElement(inputHtml).find('input');

            input.val('49091850').triggerHandler('input');

            expect(input.val()).toBe('49-091-850');
        });

        it('correctly formats a long IRD number', () => {
            var input = compileElement(inputHtml).find('input');

            input.val('136410132').triggerHandler('input');

            expect(input.val()).toBe('136-410-132');
        });

    });


    // Written according to the specs at http://www.ird.govt.nz/software-developers/software-dev-specs/
    describe('model validation', function () {

        it('returns true if no model value has been defined', function () {
            var compiled = compileElement(inputHtml);
            expect($scope.x).toBeUndefined();
            $scope.$digest();
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });

        it('returns true if the model value is an empty string', function () {
            var compiled = compileElement(inputHtml);
            $scope.x = '';
            $scope.$digest();
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });

        suppliedValidValues.forEach(function (testValue) {
            it('returns true on valid value ' + testValue, function () {
                var compiled = compileElement(inputHtml);
                
                compiled.find('input').val(testValue).triggerHandler('input');
                
                expect(compiled.hasClass('ng-valid')).toBe(true);
            });
        });

        suppliedInvalidValues.forEach(function (testValue) {
            it('returns false on invalid value ' + testValue, function () {
                var compiled = compileElement(inputHtml);
                
                compiled.find('input').val(testValue).triggerHandler('input');
                
                expect(compiled.hasClass('ng-valid')).toBe(false);
            });
        });

    });

});
