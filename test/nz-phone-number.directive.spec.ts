///<reference path="..\definitions\jasmine\jasmine.d.ts"/>
///<reference path="..\definitions\angularjs\angular.d.ts"/>
///<reference path="..\definitions\angularjs\angular-mocks.d.ts"/>

describe('NZ Phone Number', function () {

    var $scope,
        $compile,
        compileElement = (html) => {
            var element = $compile(html)($scope);
            $scope.$digest();
            return element;
        };

    var validValues = [
        '021234567',
        '0223456789',
        '027890123',
        '034567890',
        '045678901',
        '067890123',
        '076543210',
        '098765432',
        '0800123456',
        '0800123456789',
        '0900123456'
    ];
    var invalidValues = [
        '02123456',
        '09876543',
        '080012345',
        '090012345',
    ];

    beforeEach(module('nzInputFormats'));

    beforeEach(inject(function (_$rootScope_, _$compile_) {
        $scope = _$rootScope_.$new();
        $compile = _$compile_;
    }));

    var inputHtml = '<form name="test"><input name="input" ng-model="x" nz-phone-number/></form>';


    describe('directive-level validation', function () {

        it('is limited to attribute invocation', function () {
            var spy = spyOn($scope, '$watch'),
                naTemplates = [
                    '<div class="nz-phone-number"></div>',
                    '<nz-phone-number></nz-phone-number>'
                ];

            for (var i = 0; i < naTemplates.length; i++) {
                $compile(naTemplates[i])($scope);
                $scope.$digest();
                expect(spy).not.toHaveBeenCalled();
            }
        });

    });


    describe('behaviour', () => {

        it('correctly formats a landline number', () => {
            var input = compileElement(inputHtml).find('input');

            input.val('098765432').triggerHandler('input');

            expect(input.val()).toBe('09 876 5432');
        });

        it('correctly formats a mobile number', () => {
            var input = compileElement(inputHtml).find('input');

            input.val('021234567890').triggerHandler('input');

            expect(input.val()).toBe('021 234 567890');
        });

        it('correctly formats a special number', () => {
            var input = compileElement(inputHtml).find('input');

            input.val('0800123456789').triggerHandler('input');

            expect(input.val()).toBe('0800 123 456 789');
        });


    });


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

        it('returns true if the model value is null', function () {
            var compiled = compileElement(inputHtml);
            $scope.x = null;
            $scope.$digest();
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });

        validValues.forEach(function (testValue) {
            it('returns true on valid value ' + testValue, function () {
                var compiled = compileElement(inputHtml);

                compiled.find('input').val(testValue).triggerHandler('input');

                expect(compiled.hasClass('ng-valid')).toBe(true);
            });
        });

        invalidValues.forEach(function (testValue) {
            it('returns false on invalid value ' + testValue, function () {
                var compiled = compileElement(inputHtml);

                compiled.find('input').val(testValue).triggerHandler('input');

                expect(compiled.hasClass('ng-valid')).toBe(false);
            });
        });

    });

});
