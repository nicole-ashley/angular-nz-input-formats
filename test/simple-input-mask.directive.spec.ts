///<reference path="..\definitions\jasmine\jasmine.d.ts"/>
///<reference path="..\definitions\angularjs\angular.d.ts"/>
///<reference path="..\definitions\angularjs\angular-mocks.d.ts"/>

describe('Simple Input Mask', () => {
  var $scope, $compile, inputHtml;

  beforeEach(module('nzInputFormats'));
  beforeEach(inject((_$rootScope_, _$compile_) => {
    $scope = _$rootScope_;
    $compile = _$compile_;
    inputHtml = '<form name="test"><input name="input" ng-model="x" nz-simple-input-mask="{{options}}" /></form>';
  }));

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
      $scope.$apply(() => $scope.options = '{mask: "-A-9-*"}');

      input.val('a12').triggerHandler('input');

      expect(input.val()).toBe('-a-1-2');
    });

    it('does not validate on initial load if the validateOnLoad option is false', () => {
      $scope.x = 'a1b';
      $scope.options = '{mask: "A9A9", validateOnLoad: false}';

      var input = compileElement(inputHtml).find('input');
      $scope.$digest();

      expect(input.hasClass('ng-valid')).toBe(true);
    });

    it('validates on initial load if the validateOnLoad option is true', () => {
      $scope.x = 'a1b';
      $scope.options = '{mask: "A9A9", validateOnLoad: true}';

      var input = compileElement(inputHtml).find('input');
      $scope.$digest();

      expect(input.hasClass('ng-invalid')).toBe(true);
    });

    it('validates on initial load if the validateOnLoad option is missing', () => {
      $scope.x = 'a1b';
      $scope.options = '{mask: "A9A9"}';

      var input = compileElement(inputHtml).find('input');
      $scope.$digest();

      expect(input.hasClass('ng-invalid')).toBe(true);
    });
  });

  describe('behaviour', () => {
    it('selects valid input characters from left-to-right, discarding invalids', () => {
      var input = compileElement(inputHtml).find('input');
      $scope.$apply(() => $scope.options = '{mask: "9A9A"}');

      input.val('abc123def456ghi').triggerHandler('input');

      expect(input.val()).toBe('1d4g');
    });

    it('discards everything after it finds a character that does not belong in the mask at all', () => {
      var input = compileElement(inputHtml).find('input');
      $scope.$apply(() => $scope.options = '{mask: "999-999-999-999"}');

      input.val('123-456-7X8-901').triggerHandler('input');

      expect(input.val()).toBe('123-456-7');
    });
  });

  describe('model validation', () => {
    describe('with validateOnLoad active', () => {
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
        $scope.$apply(() => $scope.options = '{mask: "AAAA"}');
        compiled.find('input').val('abc').triggerHandler('input');

        expect(compiled.hasClass('ng-invalid')).toBe(true);
      });

      it('returns true on an empty string after having been invalid on a non-empty string', () => {
        $scope.$apply(() => $scope.options = '{mask: "AAAA"}');
        compiled.find('input').val('abc').triggerHandler('input');
        compiled.find('input').val('').triggerHandler('input');

        expect(compiled.hasClass('ng-valid')).toBe(true);
      });
    });

    describe('with validateOnLoad inactive', () => {
      var compiled;

      beforeEach(() => {
        $scope.options = '{validateOnLoad: false}';
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
        $scope.$apply(() => $scope.options = '{mask: "AAAA", validateOnLoad: false}');
        compiled.find('input').val('abc').triggerHandler('input');

        expect(compiled.hasClass('ng-invalid')).toBe(true);
      });

      it('returns true on an empty string after having been invalid on a non-empty string', () => {
        $scope.$apply(() => $scope.options = '{mask: "AAAA", validateOnLoad: false}');
        compiled.find('input').val('abc').triggerHandler('input');
        compiled.find('input').val('').triggerHandler('input');

        expect(compiled.hasClass('ng-valid')).toBe(true);
      });
    });
  });

  function compileElement(html) {
    var element = $compile(html)($scope);
    $scope.$digest();
    return element;
  }
});
