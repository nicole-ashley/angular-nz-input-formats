///<reference path="..\definitions\jasmine\jasmine.d.ts"/>
///<reference path="..\definitions\angularjs\angular.d.ts"/>
///<reference path="..\definitions\angularjs\angular-mocks.d.ts"/>

describe('NZ Phone Number', () => {

    var $scope,
        $compile,
        inputHtml,
        compileElement = (html) => {
            var element = $compile(html)($scope);
            $scope.$digest();
            return element;
        };

    var validValues = [
        '020234567',
        '021234567',
        '0223456789',
        '025890123',
        '027890123',
        '028890123',
        '029890123',
        '034567890',
        '045678901',
        '067890123',
        '076543210',
        '098765432',
        '0800123456',
        '0800123456789',
        '0900123456',
        '6420234567',
        '6421234567',
        '64223456789',
        '6425890123',
        '6427890123',
        '6428890123',
        '6429890123',
        '6434567890',
        '6445678901',
        '6467890123',
        '6476543210',
        '6498765432',
        '64800123456',
        '64800123456789',
        '64900123456'
    ];
    var invalidValues = [
        '02123456',
        '09876543',
        '080012345',
        '090012345'
    ];

    beforeEach(module('nzInputFormats'));

    beforeEach(inject(function (_$rootScope_, _$compile_) {
        $scope = _$rootScope_.$new();
        $compile = _$compile_;
        inputHtml = '<form name="test"><input name="input" ng-model="x" nz-phone-number="{{ options }}"/></form>';
    }));


    function setModelValue(value) {
        $scope.$apply(() => {
            $scope.x = value;
        });
    }


    describe('directive-level validation', () => {

        it('is limited to attribute invocation', () => {
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
        var input;
        beforeEach(() => {
            $scope.$apply(() => {
                $scope.options = {};
            });
            input = compileElement(inputHtml).find('input');
        });

        it('correctly formats a landline number', () => {
            setModelValue('098765432');

            expect(input.val()).toBe('09 876 5432');
        });

        it('correctly formats a landline number in international format', () => {
            setModelValue('6498765432');

            expect(input.val()).toBe('649 876 5432');
        });

        it('correctly formats a mobile number', () => {
            setModelValue('021234567890');

            expect(input.val()).toBe('021 234 567890');
        });

        it('correctly formats a mobile number in international format', () => {
            setModelValue('6421234567890');

            expect(input.val()).toBe('6421 234 567890');
        });

        it('correctly formats a special number', () => {
            setModelValue('0800123456789');

            expect(input.val()).toBe('0800 123 456 789');
        });

        it('correctly formats a special number in international format', () => {
            setModelValue('64800123456789');

            expect(input.val()).toBe('64800 123 456 789');
        });

        describe('when limited to international format', () => {
            beforeEach(() => {
                $scope.$apply(() => {
                    $scope.options.intl = true;
                });
            });

            it('accepts an international number', () => {
                setModelValue('6421234567890');

                expect(input.val()).toBe('6421 234 567890');
            });

            it('rejects a local number', () => {
                setModelValue('021234567890');

                expect(input.val()).toBe('');
            });

            describe('when limited to mobile numbers', () => {
                beforeEach(() => {
                    $scope.$apply(() => {
                       $scope.options.type = 'mobile';
                    });
                });

                it('accepts a mobile number', () => {
                   setModelValue('6421234567');

                    expect(input.val()).toBe('6421 234 567');
                });

                it('rejects a landline number', () => {
                   setModelValue('6494653627');

                    expect(input.val()).toBe('64');
                });

                it('rejects a special number', () => {
                    setModelValue('64800123456');

                    expect(input.val()).toBe('64');
                });
            });

            describe('when limited to landline numbers', () => {
                beforeEach(() => {
                    $scope.$apply(() => {
                       $scope.options.type = 'landline';
                    });
                });

                it('accepts a landline number', () => {
                   setModelValue('6494653627');

                    expect(input.val()).toBe('649 465 3627');
                });

                it('rejects a mobile number', () => {
                   setModelValue('6421234567');

                    expect(input.val()).toBe('64');
                });

                it('rejects a special number', () => {
                    setModelValue('64800123456');

                    expect(input.val()).toBe('64');
                });
            });

            describe('when limited to special numbers', () => {
                beforeEach(() => {
                    $scope.$apply(() => {
                       $scope.options.type = 'special';
                    });
                });

                it('accepts a special number', () => {
                   setModelValue('64800123456');

                    expect(input.val()).toBe('64800 123 456');
                });

                it('rejects a mobile number', () => {
                    setModelValue('6421234567');

                    expect(input.val()).toBe('64');
                });

                it('rejects a landline number', () => {
                   setModelValue('6464653627');

                    expect(input.val()).toBe('64');
                });
            });
        });

        describe('when limited to local format', () => {
            beforeEach(() => {
                $scope.$apply(() => {
                    $scope.options.intl = false;
                });
            });

            it('correctly formats a local number', () => {
                setModelValue('02123456789012');

                expect(input.val()).toBe('021 234 567890');
            });

            it('rejects an international number', () => {
                setModelValue('642123456789012');

                expect(input.val()).toBe('');
            });

            describe('when limited to mobile numbers', () => {
                beforeEach(() => {
                    $scope.$apply(() => {
                        $scope.options.type = 'mobile';
                    });
                });

                it('accepts a mobile number', () => {
                    setModelValue('021234567');

                    expect(input.val()).toBe('021 234 567');
                });

                it('rejects a landline number', () => {
                    setModelValue('094653627');

                    expect(input.val()).toBe('0');
                });

                it('rejects a special number', () => {
                    setModelValue('0800123456');

                    expect(input.val()).toBe('0');
                });
            });

            describe('when limited to landline numbers', () => {
                beforeEach(() => {
                    $scope.$apply(() => {
                        $scope.options.type = 'landline';
                    });
                });

                it('accepts a landline number', () => {
                    setModelValue('094653627');

                    expect(input.val()).toBe('09 465 3627');
                });

                it('rejects a mobile number', () => {
                    setModelValue('021234567');

                    expect(input.val()).toBe('0');
                });

                it('rejects a special number', () => {
                    setModelValue('0800123456');

                    expect(input.val()).toBe('0');
                });
            });

            describe('when limited to special numbers', () => {
                beforeEach(() => {
                    $scope.$apply(() => {
                        $scope.options.type = 'special';
                    });
                });

                it('accepts a special number', () => {
                    setModelValue('0800123456');

                    expect(input.val()).toBe('0800 123 456');
                });

                it('rejects a mobile number', () => {
                    setModelValue('021234567');

                    expect(input.val()).toBe('0');
                });

                it('rejects a landline number', () => {
                    setModelValue('064653627');

                    expect(input.val()).toBe('0');
                });
            });
        });

    });


    describe('model validation', () => {

        it('returns true if no model value has been defined', () => {
            var compiled = compileElement(inputHtml);
            expect($scope.x).toBeUndefined();
            $scope.$digest();
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });

        it('returns true if the model value is an empty string', () => {
            var compiled = compileElement(inputHtml);
            $scope.x = '';
            $scope.$digest();
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });

        it('returns true if the model value is null', () => {
            var compiled = compileElement(inputHtml);
            $scope.x = null;
            $scope.$digest();
            expect(compiled.hasClass('ng-valid')).toBe(true);
        });

        validValues.forEach(function (testValue) {
            it('returns true on valid value ' + testValue, () => {
                var compiled = compileElement(inputHtml);

                compiled.find('input').val(testValue).triggerHandler('input');

                expect(compiled.hasClass('ng-valid')).toBe(true);
            });
        });

        invalidValues.forEach(function (testValue) {
            it('returns false on invalid value ' + testValue, () => {
                var compiled = compileElement(inputHtml);

                compiled.find('input').val(testValue).triggerHandler('input');

                expect(compiled.hasClass('ng-valid')).toBe(false);
            });
        });

    });

});
