import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const context={};
vm.createContext(context);
vm.runInContext(await readFile(new URL('../../assets/js/phone-format.js',import.meta.url),'utf8'),context);
const phone=context.NoshutdownPhone;

test('formats Turkish phone numbers while typing and for card display',()=>{
  assert.equal(phone.formatNational('+90','5555555555'),'(555) 555 55 55');
  assert.equal(phone.formatNational('+90','55555'),'(555) 55');
  assert.equal(phone.formatInternational('+90 5555555555'),'+90 (555) 555 55 55');
  assert.equal(phone.normalize('+90','(555) 555 55 55'),'+90 5555555555');
});

test('uses the selected country format and enforces its national length',()=>{
  const fixtures=[
    ['+1','4155552671','(415) 555-2671'],
    ['+44','7911123456','7911 123456'],
    ['+49','1512345678','151 234 5678'],
    ['+33','612345678','6 12 34 56 78'],
    ['+31','612345678','6 1234 5678'],
    ['+39','3123456789','312 345 6789'],
    ['+34','612345678','612 345 678'],
    ['+971','501234567','50 123 4567'],
    ['+966','501234567','50 123 4567'],
    ['+994','501234567','50 123 45 67']
  ];
  for(const [code,input,want] of fixtures) assert.equal(phone.formatNational(code,input),want,code);
  assert.equal(phone.normalize('+90','555555555599'),'+90 5555555555');
});

test('splits existing formatted values without losing the selected country',()=>{
  assert.deepEqual({...phone.split('+90 (555) 555 55 55')},{code:'+90',digits:'5555555555'});
  assert.deepEqual({...phone.split('+1 (415) 555-2671')},{code:'+1',digits:'4155552671'});
  assert.deepEqual({...phone.split('555 555 55 55')},{code:'+90',digits:'5555555555'});
  assert.equal(phone.toDialable('+90 (555) 555 55 55'),'+905555555555');
});
